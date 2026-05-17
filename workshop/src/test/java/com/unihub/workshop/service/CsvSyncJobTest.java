package com.unihub.workshop.service;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CsvSyncJobTest {

    @Test
    void parseCsvLineKeepsCommaInsideQuotedField() {
        assertThat(CsvSyncJob.parseCsvLine("SE150001,\"Nguyen, Van A\",nva@fpt.edu.vn,CNTT,0123456789"))
                .containsExactly("SE150001", "Nguyen, Van A", "nva@fpt.edu.vn", "CNTT", "0123456789");
    }

    @Test
    void parseCsvLineUnescapesDoubleQuotesInsideQuotedField() {
        assertThat(CsvSyncJob.parseCsvLine("SE150002,\"Tran \"\"Bee\"\"\",ttb@fpt.edu.vn,Kinh Te,0987654321"))
                .containsExactly("SE150002", "Tran \"Bee\"", "ttb@fpt.edu.vn", "Kinh Te", "0987654321");
    }

    @Test
    void parseCsvLineAllowsShortRowsSoImporterCanCountThemAsErrors() {
        assertThat(CsvSyncJob.parseCsvLine("SE150003,Le Van C,lvc@fpt.edu.vn"))
                .containsExactly("SE150003", "Le Van C", "lvc@fpt.edu.vn");
    }

    @Test
    void parseCsvLineRejectsUnclosedQuote() {
        assertThatThrownBy(() -> CsvSyncJob.parseCsvLine("SE150004,\"Pham Thi D,ptd@fpt.edu.vn,CNTT,0909876543"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("chưa đóng");
    }

    @Test
    void validateStudentRowRejectsLeadingCommaRow() {
        assertThatThrownBy(() -> CsvSyncJob.validateStudentRow(
                CsvSyncJob.parseCsvLine(",SE123456,Dam Mi,dm@fpt.edu.vnKK,091203203")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("student_id rỗng");
    }

    @Test
    void validateStudentRowRejectsMissingColumns() {
        assertThatThrownBy(() -> CsvSyncJob.validateStudentRow(
                CsvSyncJob.parseCsvLine("SE223456,BAO,0121203203")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Sai số cột (3/5)");
    }

    @Test
    void validateStudentRowRejectsCommaInsideUnquotedEmail() {
        assertThatThrownBy(() -> CsvSyncJob.validateStudentRow(
                CsvSyncJob.parseCsvLine("SE950004,Pham Thi D,ptd@fpt,edu.vn,Truyen Thong,0909876543")))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Sai số cột (6/5)");
    }
}
