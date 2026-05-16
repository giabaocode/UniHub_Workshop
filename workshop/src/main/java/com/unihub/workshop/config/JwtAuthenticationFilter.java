package com.unihub.workshop.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Date;
import java.util.concurrent.ConcurrentHashMap;

import io.jsonwebtoken.JwtException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final ConcurrentHashMap<String, CachedUserDetails> authCache = new ConcurrentHashMap<>();

    @Value("${app.jwt-auth-cache.enabled:true}")
    private boolean authCacheEnabled;

    @Value("${app.jwt-auth-cache.ttl-ms:300000}")
    private long authCacheTtlMs;

    @Value("${app.jwt-auth-cache.max-size:30000}")
    private int authCacheMaxSize;

    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");
        String jwt = null;
        final String userEmail;

        // Bypass Preflight (OPTIONS) requests explicitly
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            jwt = authHeader.substring(7);
        } else if (request.getRequestURI().startsWith("/api/notifications/")) {
            String accessToken = request.getParameter("access_token");
            String token = request.getParameter("token");
            if (accessToken != null && !accessToken.isBlank()) {
                jwt = accessToken;
            } else if (token != null && !token.isBlank()) {
                jwt = token;
            }
        }

        if (jwt == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            if (tryUseCachedAuthentication(jwt, request)) {
                filterChain.doFilter(request, response);
                return;
            }

            userEmail = jwtService.extractUsername(jwt);
        } catch (JwtException | IllegalArgumentException e) {
            SecurityContextHolder.clearContext();
            filterChain.doFilter(request, response);
            return;
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

            if (jwtService.isTokenValid(jwt, userDetails)) {
                setAuthentication(userDetails, request);
                cacheAuthentication(jwt, userDetails);
            }
        }
        filterChain.doFilter(request, response);
    }

    private boolean tryUseCachedAuthentication(String jwt, HttpServletRequest request) {
        if (!authCacheEnabled || SecurityContextHolder.getContext().getAuthentication() != null) {
            return false;
        }

        CachedUserDetails cached = authCache.get(jwt);
        long now = System.currentTimeMillis();
        if (cached == null) {
            return false;
        }

        if (cached.expiresAtMillis <= now) {
            authCache.remove(jwt);
            return false;
        }

        setAuthentication(cached.userDetails, request);
        return true;
    }

    private void cacheAuthentication(String jwt, UserDetails userDetails) {
        if (!authCacheEnabled) {
            return;
        }

        if (authCache.size() >= authCacheMaxSize) {
            authCache.clear();
        }

        Date tokenExpiration = jwtService.extractExpiration(jwt);
        long maxTtlExpiration = System.currentTimeMillis() + authCacheTtlMs;
        long expiresAt = Math.min(tokenExpiration.getTime(), maxTtlExpiration);
        authCache.put(jwt, new CachedUserDetails(userDetails, expiresAt));
    }

    private void setAuthentication(UserDetails userDetails, HttpServletRequest request) {
        UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                userDetails,
                null,
                userDetails.getAuthorities()
        );
        authToken.setDetails(
                new WebAuthenticationDetailsSource().buildDetails(request)
        );
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }

    private record CachedUserDetails(UserDetails userDetails, long expiresAtMillis) {
    }
}
