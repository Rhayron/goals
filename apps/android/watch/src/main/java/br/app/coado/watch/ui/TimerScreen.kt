package br.app.coado.watch.ui

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.ScreenScaffold
import androidx.wear.compose.material3.Text
import br.app.coado.shared.R
import br.app.coado.shared.model.Mode
import br.app.coado.shared.model.fmtClock
import br.app.coado.shared.model.fmtDuration
import br.app.coado.shared.timer.Phase
import br.app.coado.shared.timer.TimerState
import br.app.coado.shared.timer.label
import br.app.coado.shared.ui.Coffee
import br.app.coado.shared.ui.CoffeeType
import br.app.coado.shared.ui.CupArt
import br.app.coado.shared.ui.ProgressRing
import br.app.coado.shared.ui.RoundDots
import br.app.coado.shared.ui.parseColor
import kotlinx.coroutines.delay

/**
 * O relógio da sessão. Enquanto a tela está acesa, um tique por segundo recompõe o número e o
 * anel; no modo ambiente a MainActivity cobre esta tela com a [AmbientScreen] e o tique para.
 * O café vai sendo coado na xícara ao longo do estudo; na pausa, ela fumega.
 */
@Composable
fun TimerScreen(state: TimerState, onToggle: () -> Unit, onSkip: () -> Unit, onFinish: () -> Unit) {
    val ambient = LocalAmbient.current
    val animate = LocalAnimations.current
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(state.running, state.phase, state.segmentStartedAt, ambient.on) {
        now = System.currentTimeMillis()
        if (!state.running || ambient.on) return@LaunchedEffect
        while (true) {
            delay(1000 - System.currentTimeMillis() % 1000)
            now = System.currentTimeMillis()
        }
    }

    val subjectColor = parseColor(state.subjectColor)
    val isBreak = state.isBreak
    val ringColor = if (isBreak) Coffee.Ok else subjectColor
    val progress = if (state.mode == Mode.FREE) 0f else state.progress(now)
    val display = if (state.mode == Mode.FREE) fmtClock(state.elapsedMs(now)) else fmtClock(state.remainingMs(now))
    val phaseText = if (state.mode == Mode.FREE) "Livre" else state.phase.label

    ScreenScaffold {
        Box(Modifier.fillMaxSize().background(Coffee.Bg), contentAlignment = Alignment.Center) {
            if (state.mode == Mode.POMODORO) {
                ProgressRing(Modifier.fillMaxSize().padding(3.dp), progress = progress, color = ringColor, track = Coffee.Line, stroke = 6.dp)
            } else {
                ProgressRing(Modifier.fillMaxSize().padding(3.dp), progress = 0f, color = ringColor, track = Coffee.Line, stroke = 4.dp)
            }
            // a xícara ao fundo, discreta: enche com o estudo, fumega na pausa
            CupArt(
                Modifier.size(82.dp).offset(y = 10.dp).alpha(if (isBreak) 0.5f else 0.32f),
                level = if (state.mode == Mode.FREE) 1f else if (isBreak) 1f else progress,
                steaming = isBreak || state.mode == Mode.FREE,
                animate = animate && state.running,
                liquid = subjectColor,
            )
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center, modifier = Modifier.fillMaxSize().padding(horizontal = 26.dp)) {
                AnimatedContent(
                    targetState = phaseText,
                    transitionSpec = { (fadeIn(tween(220)) + scaleIn(tween(220), initialScale = 0.7f)) togetherWith fadeOut(tween(120)) },
                    label = "etapa",
                ) { label ->
                    Label(label, color = if (isBreak) Coffee.Ok else Coffee.Brand300)
                }
                Text(
                    state.subjectName,
                    style = CoffeeType.bodySmall,
                    color = Coffee.Muted,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    textAlign = TextAlign.Center,
                )
                Text(
                    display,
                    style = CoffeeType.display.copy(fontSize = if (display.length > 5) 36.sp else 44.sp),
                    color = if (state.running) Coffee.Ink else Coffee.Muted,
                    maxLines = 1,
                )
                if (state.mode == Mode.POMODORO) {
                    RoundDots(round = state.round, rounds = state.rounds, color = subjectColor)
                }
                Text(
                    if (state.running) "estudado ${fmtDuration((state.studiedMs(now) / 1000).toInt())}" else "pausado",
                    style = CoffeeType.bodySmall,
                    color = Coffee.Muted,
                    modifier = Modifier.padding(top = 2.dp),
                )
                Spacer(Modifier.height(6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                    RoundButton(R.drawable.ic_stop, "Finalizar e registrar", onFinish, size = 34.dp, color = Coffee.Surface2, tint = Coffee.Bad)
                    RoundButton(
                        if (state.running) R.drawable.ic_pause else R.drawable.ic_play,
                        if (state.running) "Pausar" else "Continuar",
                        onToggle,
                        size = 46.dp,
                        color = Coffee.Brand100,
                        tint = Coffee.Bg,
                    )
                    RoundButton(R.drawable.ic_skip, "Pular etapa", onSkip, size = 34.dp, color = Coffee.Surface2, enabled = state.mode == Mode.POMODORO)
                }
            }
        }
    }
}

/**
 * A tela no modo ambiente: preto, só contornos, atualizada uma vez por minuto pelo sistema.
 * Com proteção contra marcação, o conteúdo anda alguns pixels a cada atualização.
 */
@Composable
fun AmbientScreen(state: TimerState, ambient: Ambient) {
    val now = remember(ambient.tick) { System.currentTimeMillis() }
    val shift = if (ambient.burnIn) ((ambient.tick % 3) - 1) * 3 else 0
    val white = if (ambient.lowBit) Color.White else Coffee.Ink
    val dim = if (ambient.lowBit) Color.White else Coffee.Muted
    Box(Modifier.fillMaxSize().background(Color.Black), contentAlignment = Alignment.Center) {
        if (!state.active) {
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.offset(shift.dp, shift.dp)) {
                Text("coado", style = CoffeeType.title, color = dim)
                Text(java.time.LocalTime.now().toString().take(5), style = CoffeeType.display, color = white)
            }
            return@Box
        }
        val progress = if (state.mode == Mode.FREE) 0f else state.progress(now)
        ProgressRing(Modifier.fillMaxSize().padding(6.dp), progress = progress, color = white, track = Color(0xFF2A2A2A), stroke = 3.dp, endDot = false)
        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.offset(shift.dp, shift.dp).padding(horizontal = 30.dp)) {
            Label(if (state.mode == Mode.FREE) "Livre" else state.phase.label, color = dim)
            val minutes = if (state.mode == Mode.FREE) state.elapsedMs(now) / 60_000 else (state.remainingMs(now) + 59_999) / 60_000
            Text(minutes.toString(), style = CoffeeType.display.copy(fontSize = 52.sp), color = white)
            Text(if (state.running) "min" else "pausado", style = CoffeeType.bodySmall, color = dim)
            Text(state.subjectName, style = CoffeeType.bodySmall, color = dim, maxLines = 1, overflow = TextOverflow.Ellipsis, textAlign = TextAlign.Center)
            if (state.mode == Mode.POMODORO && state.phase == Phase.STUDY) {
                Text("rodada ${state.round} de ${state.rounds}", style = CoffeeType.bodySmall, color = dim)
            }
        }
    }
}
