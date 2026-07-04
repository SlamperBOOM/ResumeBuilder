package com.slamperboom.htmlConverter;

import com.openhtmltopdf.outputdevice.helper.BaseRendererBuilder;

import java.io.File;

public record FontInfo(File file, String family, int weight, BaseRendererBuilder.FontStyle style) {}
