module ResumeBuilder.main {
    requires javafx.controls;
    requires javafx.fxml;
    requires lombok;
    requires com.fasterxml.jackson.databind;

    opens com.slamperboom to javafx.fxml;
    exports com.slamperboom;
}