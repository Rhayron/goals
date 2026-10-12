package br.app.coado.shared.ui

import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.clipPath
import androidx.compose.ui.graphics.drawscope.scale
import androidx.compose.ui.graphics.drawscope.translate
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import kotlin.math.PI
import kotlin.math.sin

/*
 * As ilustrações do site (apps/web/src/components/art.tsx e cafe-art.tsx) em Canvas: a xícara
 * de traço "feito à mão" que enche enquanto o café é coado, o vapor e o anel de progresso.
 * As animações só rodam quando pedidas (tela acesa, animações ligadas): fora disso é um quadro parado.
 */

/** O contorno da xícara, no sistema de 120×110 do SVG original */
private fun cupBody() = Path().apply {
    moveTo(26f, 46f)
    lineTo(86f, 46f)
    lineTo(86f, 70f)
    arcTo(Rect(42f, 48f, 86f, 92f), 0f, 90f, false)
    lineTo(48f, 92f)
    arcTo(Rect(26f, 48f, 70f, 92f), 90f, 90f, false)
    close()
}

private fun handle() = Path().apply {
    moveTo(86f, 52f)
    lineTo(94f, 52f)
    arcTo(Rect(85f, 52f, 103f, 70f), -90f, 180f, false)
    lineTo(86f, 70f)
}

private fun wisp(x: Float) = Path().apply {
    moveTo(x, 34f)
    cubicTo(x - 5f, 28f, x + 5f, 26f, x, 20f)
}

/** o coador (dripper) em cima da xícara, enquanto o café é passado */
private fun dripper() = Path().apply {
    moveTo(38f, 4f)
    lineTo(74f, 4f)
    lineTo(62f, 20f)
    lineTo(50f, 20f)
    close()
}

/**
 * A xícara. [level] é o quanto está cheia (0..1); com [brewing] o café pinga do coador;
 * com [steaming] ela solta vapor. [animate] desligado congela tudo (modo ambiente, economia).
 */
@Composable
fun CupArt(
    modifier: Modifier = Modifier,
    level: Float = 1f,
    steaming: Boolean = false,
    brewing: Boolean = false,
    animate: Boolean = true,
    liquid: Color = Coffee.Brand600,
    ink: Color = Coffee.Ink,
    body: Color = Coffee.Surface2,
    strokeWidth: Float = 2f,
) {
    val steamT = if (animate && steaming) {
        rememberInfiniteTransition(label = "vapor")
            .animateFloat(0f, 1f, infiniteRepeatable(tween(3200, easing = LinearEasing), RepeatMode.Restart), label = "vapor").value
    } else -1f
    val dripT = if (animate && brewing) {
        rememberInfiniteTransition(label = "gota")
            .animateFloat(0f, 1f, infiniteRepeatable(tween(1700, easing = LinearEasing), RepeatMode.Restart), label = "gota").value
    } else -1f
    val lvl = level.coerceIn(0f, 1f)

    Canvas(modifier) {
        val s = minOf(size.width / 120f, size.height / 110f)
        val dx = (size.width - 120f * s) / 2f
        val dy = (size.height - 110f * s) / 2f
        translate(dx, dy) {
            scale(s, s, pivot = Offset.Zero) {
                val stroke = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                // sombra e pires
                drawOval(ink.copy(alpha = 0.08f), topLeft = Offset(16f, 99f), size = Size(84f, 10f))
                drawOval(Coffee.Brand200.copy(alpha = 0.9f), topLeft = Offset(16f, 91f), size = Size(80f, 10f))
                drawOval(ink, topLeft = Offset(16f, 91f), size = Size(80f, 10f), style = stroke)
                // corpo
                val cup = cupBody()
                drawPath(cup, body)
                if (lvl > 0f) {
                    clipPath(cup) {
                        val top = 92f - 46f * lvl
                        val wave = Path().apply {
                            moveTo(20f, top + 1.5f)
                            var x = 20f
                            while (x < 92f) {
                                quadraticTo(x + 6f, top - 1.5f, x + 12f, top + 1.5f)
                                x += 12f
                            }
                            lineTo(92f, 96f)
                            lineTo(20f, 96f)
                            close()
                        }
                        drawPath(wave, liquid)
                        // reflexo na superfície
                        drawPath(
                            Path().apply {
                                moveTo(40f, top + 7f)
                                cubicTo(46f, top + 11f, 58f, top + 11f, 64f, top + 7f)
                            },
                            Coffee.Brand200.copy(alpha = 0.45f),
                            style = stroke,
                        )
                    }
                }
                drawPath(cup, ink, style = stroke)
                drawPath(handle(), ink, style = stroke)

                if (brewing) {
                    drawPath(dripper(), Coffee.Brand100.copy(alpha = 0.9f))
                    drawPath(dripper(), ink, style = stroke)
                    if (dripT >= 0f) {
                        val top = 92f - 46f * lvl
                        val p = dripT
                        val y = 22f + (top - 24f) * p * p
                        val alpha = if (p < 0.85f) 1f else (1f - (p - 0.85f) / 0.15f)
                        drawCircle(liquid.copy(alpha = alpha), radius = 2.6f, center = Offset(56f, y))
                        if (p > 0.85f) drawOval(liquid.copy(alpha = alpha * 0.6f), topLeft = Offset(50f, top - 1.5f), size = Size(12f, 3f), style = Stroke(1f))
                    }
                }

                if (steaming) {
                    listOf(42f, 56f, 70f).forEachIndexed { i, x ->
                        val p = if (steamT >= 0f) ((steamT + i * 0.3f) % 1f) else 0.35f + i * 0.15f
                        val alpha = sin(p * PI).toFloat() * 0.7f
                        translate(0f, -18f * p) {
                            drawPath(wisp(x), ink.copy(alpha = alpha), style = stroke)
                        }
                    }
                }
            }
        }
    }
}

/** O anel de progresso da etapa: trilho fino e arco na cor da disciplina, com a ponta redonda */
@Composable
fun ProgressRing(
    modifier: Modifier = Modifier,
    progress: Float,
    color: Color,
    track: Color = Coffee.Line,
    stroke: Dp = 6.dp,
    startAngle: Float = -90f,
    endDot: Boolean = true,
) {
    Canvas(modifier) {
        drawRing(progress.coerceIn(0f, 1f), color, track, stroke.toPx(), startAngle, endDot)
    }
}

fun DrawScope.drawRing(progress: Float, color: Color, track: Color, strokeWidth: Float, startAngle: Float = -90f, endDot: Boolean = true) {
    val inset = strokeWidth / 2f
    val rect = Rect(inset, inset, size.width - inset, size.height - inset)
    drawArc(track, 0f, 360f, false, topLeft = rect.topLeft, size = rect.size, style = Stroke(strokeWidth))
    if (progress > 0f) {
        drawArc(color, startAngle, 360f * progress, false, topLeft = rect.topLeft, size = rect.size, style = Stroke(strokeWidth, cap = StrokeCap.Round))
        if (endDot) {
            val a = Math.toRadians((startAngle + 360f * progress).toDouble())
            val c = Offset(rect.center.x + rect.width / 2f * Math.cos(a).toFloat(), rect.center.y + rect.height / 2f * Math.sin(a).toFloat())
            drawCircle(Coffee.Ink, radius = strokeWidth * 0.35f, center = c)
        }
    }
}

/** A rosca do ciclo (CycleDonut do site): uma fatia por sessão, na cor da disciplina */
@Composable
fun Donut(
    modifier: Modifier = Modifier,
    slices: List<Pair<Color, Float>>,
    thickness: Dp = 10.dp,
    gap: Float = 1.5f,
    track: Color = Coffee.Line,
) {
    Canvas(modifier) {
        val w = thickness.toPx()
        val inset = w / 2f
        val rect = Rect(inset, inset, size.width - inset, size.height - inset)
        val total = slices.sumOf { it.second.toDouble() }.toFloat()
        if (total <= 0f) {
            drawArc(track, 0f, 360f, false, topLeft = rect.topLeft, size = rect.size, style = Stroke(w))
            return@Canvas
        }
        var angle = -90f
        val g = if (slices.size > 1) gap else 0f
        for ((color, value) in slices) {
            val sweep = 360f * value / total
            if (sweep > g) drawArc(color, angle + g / 2f, sweep - g, false, topLeft = rect.topLeft, size = rect.size, style = Stroke(w))
            angle += sweep
        }
    }
}

/** As rodadas do pomodoro: uma bolinha por sessão de estudo, cheias as já feitas */
@Composable
fun RoundDots(round: Int, rounds: Int, color: Color, modifier: Modifier = Modifier, dot: Dp = 6.dp) {
    Row(modifier) {
        for (i in 1..rounds.coerceIn(1, 12)) {
            if (i > 1) Spacer(Modifier.width(dot * 0.8f))
            Canvas(Modifier.size(dot)) {
                if (i < round) drawCircle(color)
                else if (i == round) drawCircle(color, style = Stroke(1.5f.dp.toPx()))
                else drawCircle(color.copy(alpha = 0.3f), style = Stroke(1.dp.toPx()))
            }
        }
    }
}
