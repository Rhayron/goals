package br.app.coado.phone.ui

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import br.app.coado.shared.ui.Coffee
import br.app.coado.shared.ui.Fraunces
import br.app.coado.shared.ui.Nunito

/** O tema do site no celular: a tarde na cafeteria de dia, a madrugada de lofi à noite */
private val Dark = darkColorScheme(
    primary = Coffee.Brand300,
    onPrimary = Coffee.Bg,
    primaryContainer = Coffee.Brand700,
    onPrimaryContainer = Coffee.Brand100,
    secondary = Coffee.Ok,
    onSecondary = Coffee.Bg,
    tertiary = Coffee.Warn,
    background = Coffee.Bg,
    onBackground = Coffee.Ink,
    surface = Coffee.Surface,
    onSurface = Coffee.Ink,
    surfaceVariant = Coffee.Surface2,
    onSurfaceVariant = Coffee.Muted,
    surfaceContainer = Coffee.Surface2,
    surfaceContainerHigh = Coffee.Line,
    outline = Coffee.Line,
    outlineVariant = Coffee.Kraft,
    error = Coffee.Bad,
    onError = Coffee.Bg,
)

private val Light = lightColorScheme(
    primary = Coffee.Brand600,
    onPrimary = Coffee.Brand50,
    primaryContainer = Coffee.Brand100,
    onPrimaryContainer = Coffee.Brand800,
    secondary = Coffee.Light.Ok,
    onSecondary = Coffee.Brand50,
    tertiary = Coffee.Light.Warn,
    background = Coffee.Light.Bg,
    onBackground = Coffee.Light.Ink,
    surface = Coffee.Light.Surface,
    onSurface = Coffee.Light.Ink,
    surfaceVariant = Coffee.Light.Surface2,
    onSurfaceVariant = Coffee.Light.Muted,
    surfaceContainer = Coffee.Light.Surface2,
    surfaceContainerHigh = Coffee.Light.Line,
    outline = Coffee.Light.Line,
    outlineVariant = Coffee.Light.Line,
    error = Coffee.Light.Bad,
    onError = Coffee.Brand50,
)

private val PhoneTypography = Typography(
    displayLarge = TextStyle(fontFamily = Fraunces, fontWeight = FontWeight.Bold, fontSize = 64.sp, letterSpacing = (-1.5).sp, fontFeatureSettings = "tnum"),
    headlineMedium = TextStyle(fontFamily = Fraunces, fontWeight = FontWeight.Bold, fontSize = 26.sp),
    headlineSmall = TextStyle(fontFamily = Fraunces, fontWeight = FontWeight.SemiBold, fontSize = 22.sp),
    titleLarge = TextStyle(fontFamily = Fraunces, fontWeight = FontWeight.SemiBold, fontSize = 20.sp),
    titleMedium = TextStyle(fontFamily = Nunito, fontWeight = FontWeight.Bold, fontSize = 16.sp),
    titleSmall = TextStyle(fontFamily = Nunito, fontWeight = FontWeight.Bold, fontSize = 14.sp),
    bodyLarge = TextStyle(fontFamily = Nunito, fontWeight = FontWeight.Medium, fontSize = 16.sp),
    bodyMedium = TextStyle(fontFamily = Nunito, fontWeight = FontWeight.Medium, fontSize = 14.sp),
    bodySmall = TextStyle(fontFamily = Nunito, fontWeight = FontWeight.Medium, fontSize = 12.sp),
    labelLarge = TextStyle(fontFamily = Nunito, fontWeight = FontWeight.Bold, fontSize = 14.sp),
    labelMedium = TextStyle(fontFamily = Nunito, fontWeight = FontWeight.Bold, fontSize = 12.sp, letterSpacing = 0.8.sp),
    labelSmall = TextStyle(fontFamily = Nunito, fontWeight = FontWeight.Bold, fontSize = 11.sp, letterSpacing = 1.sp),
)

@Composable
fun PhoneTheme(dark: Boolean = isSystemInDarkTheme(), content: @Composable () -> Unit) {
    MaterialTheme(colorScheme = if (dark) Dark else Light, typography = PhoneTypography, content = content)
}
