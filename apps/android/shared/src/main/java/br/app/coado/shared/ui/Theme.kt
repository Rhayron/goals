package br.app.coado.shared.ui

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.Font
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontVariation
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp
import br.app.coado.shared.R

/**
 * Os tokens do site (apps/web/src/index.css), na "madrugada de lofi" (o modo noturno): o fundo
 * quase preto do AMOLED, o papel kraft, o mocha e o caramelo da marca.
 */
object Coffee {
    val Bg = Color(0xFF1B1410)
    val Surface = Color(0xFF251C16)
    val Surface2 = Color(0xFF30251D)
    val Line = Color(0xFF3E3026)
    val Ink = Color(0xFFF1E6D7)
    val Muted = Color(0xFFB59E8A)
    val Kraft = Color(0xFF3B2D22)
    val Ok = Color(0xFF8FB892)
    val Bad = Color(0xFFD98783)
    val Warn = Color(0xFFE2B55E)

    val Brand50 = Color(0xFFF9F1E7)
    val Brand100 = Color(0xFFF1E1CF)
    val Brand200 = Color(0xFFE4C7A8)
    val Brand300 = Color(0xFFD3A97F)
    val Brand400 = Color(0xFFC08F5D)
    val Brand500 = Color(0xFFAD7A4A)
    val Brand600 = Color(0xFF96663B)
    val Brand700 = Color(0xFF7A512F)
    val Brand800 = Color(0xFF5C3D24)
    val Brand900 = Color(0xFF432C1B)

    /** ☀️ tarde na cafeteria (o modo claro do site, para o celular de dia) */
    object Light {
        val Bg = Color(0xFFF4ECE1)
        val Surface = Color(0xFFFFFAF2)
        val Surface2 = Color(0xFFF1E5D5)
        val Line = Color(0xFFE3D3BF)
        val Ink = Color(0xFF3A2A1F)
        val Muted = Color(0xFF8C7563)
        val Ok = Color(0xFF6F9A73)
        val Bad = Color(0xFFC96F6B)
        val Warn = Color(0xFFD9A441)
    }
}

/** "#c08f5d" → Color; qualquer coisa estranha vira o caramelo da marca */
fun parseColor(hex: String): Color {
    val h = hex.trim().removePrefix("#")
    return runCatching {
        when (h.length) {
            6 -> Color(0xFF000000L or h.toLong(16))
            8 -> Color(h.toLong(16))
            3 -> Color(0xFF000000L or h.map { "$it$it" }.joinToString("").toLong(16))
            else -> Coffee.Brand400
        }
    }.getOrDefault(Coffee.Brand400)
}

/** Nunito, a fonte de texto do site (variável: um arquivo, todos os pesos) */
val Nunito = FontFamily(
    Font(R.font.nunito, FontWeight.Normal, variationSettings = FontVariation.Settings(FontVariation.weight(400))),
    Font(R.font.nunito, FontWeight.Medium, variationSettings = FontVariation.Settings(FontVariation.weight(500))),
    Font(R.font.nunito, FontWeight.SemiBold, variationSettings = FontVariation.Settings(FontVariation.weight(600))),
    Font(R.font.nunito, FontWeight.Bold, variationSettings = FontVariation.Settings(FontVariation.weight(700))),
    Font(R.font.nunito, FontWeight.ExtraBold, variationSettings = FontVariation.Settings(FontVariation.weight(800))),
)

private fun fraunces(weight: Int, w: FontWeight) = Font(
    R.font.fraunces,
    w,
    // os mesmos eixos do site: SOFT 100, WONK 1
    variationSettings = FontVariation.Settings(
        FontVariation.weight(weight),
        FontVariation.Setting("SOFT", 100f),
        FontVariation.Setting("WONK", 1f),
        FontVariation.Setting("opsz", 72f),
    ),
)

/** Fraunces, a fonte de título do site */
val Fraunces = FontFamily(
    fraunces(500, FontWeight.Medium),
    fraunces(600, FontWeight.SemiBold),
    fraunces(700, FontWeight.Bold),
)

/** Os estilos de texto comuns; cada app ajusta o tamanho à tela */
object CoffeeType {
    /** o relógio da sessão */
    val display = TextStyle(fontFamily = Fraunces, fontWeight = FontWeight.Bold, fontSize = 44.sp, letterSpacing = (-1).sp, fontFeatureSettings = "tnum")
    val numeral = TextStyle(fontFamily = Fraunces, fontWeight = FontWeight.Bold, fontSize = 24.sp, fontFeatureSettings = "tnum")
    val title = TextStyle(fontFamily = Fraunces, fontWeight = FontWeight.SemiBold, fontSize = 18.sp)
    val subtitle = TextStyle(fontFamily = Nunito, fontWeight = FontWeight.Bold, fontSize = 14.sp)
    val body = TextStyle(fontFamily = Nunito, fontWeight = FontWeight.Medium, fontSize = 13.sp)
    val bodySmall = TextStyle(fontFamily = Nunito, fontWeight = FontWeight.Medium, fontSize = 11.sp)
    /** o "label" do site: caixa alta, espaçado */
    val label = TextStyle(fontFamily = Nunito, fontWeight = FontWeight.Bold, fontSize = 10.sp, letterSpacing = 1.2.sp)
    val button = TextStyle(fontFamily = Nunito, fontWeight = FontWeight.Bold, fontSize = 13.sp)
}
