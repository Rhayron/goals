package br.app.coado.phone.timer

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import br.app.coado.phone.CoadoPhoneApp
import br.app.coado.phone.R as PhoneR
import br.app.coado.shared.R
import br.app.coado.shared.model.Dates
import br.app.coado.shared.model.Draft
import br.app.coado.shared.model.LocalPrefs
import br.app.coado.shared.model.Mode
import br.app.coado.shared.model.Overview
import br.app.coado.shared.model.SEM_DISCIPLINA
import br.app.coado.shared.model.SubjectLite
import br.app.coado.shared.model.fmtClock
import br.app.coado.shared.model.fmtDuration
import br.app.coado.shared.model.fmtMinutes
import br.app.coado.shared.timer.Phase
import br.app.coado.shared.timer.TimerState
import br.app.coado.shared.timer.label
import br.app.coado.shared.ui.Badge
import br.app.coado.shared.ui.Cores
import br.app.coado.shared.ui.manchete
import br.app.coado.shared.ui.parseColor
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

/** Os tons da cena lo-fi do site (o cartão do pomodoro sobre a ilustração) */
private val SceneInk = Color(0xFFFFF2D9)
private val SceneMuted = Color(0xFFD1BEAA)
private val SceneAccent = Color(0xFFE0B88A)
private val SceneCard = Color(0xFF201B16)

/** Escolha → sessão → registro → pronto */
@Composable
fun PomodoroFlow(
    app: CoadoPhoneApp,
    view: Overview,
    prefs: LocalPrefs,
    timer: TimerState,
    draft: Draft?,
    request: TimerRequest,
    ensureNotifications: () -> Unit,
    onClose: () -> Unit,
) {
    val scope = rememberCoroutineScope()
    var saved by remember { mutableStateOf(false) }
    Box(Modifier.fillMaxSize().background(PomodoroActivity.Overlay)) {
        when {
            saved -> SavedPane(view) { saved = false; onClose() }
            draft != null -> RegisterPane(
                draft = draft,
                view = view,
                onSave = { final, category, hits, misses, counts, reviews ->
                    scope.launch {
                        runCatching { app.engine.register(final, category, hits, misses, counts, reviews) }
                        saved = true
                    }
                },
                onDiscard = { scope.launch { app.engine.discard() } },
            )
            timer.active -> SessionPane(
                state = timer,
                animate = prefs.animations,
                onToggle = { scope.launch { app.engine.toggle() } },
                onSkip = { scope.launch { app.engine.skip() } },
                onFinish = { scope.launch { if (app.engine.finish() == null) onClose() } },
                onClose = onClose,
            )
            else -> PickPane(
                view = view,
                prefs = prefs,
                request = request,
                onMode = { m -> scope.launch { app.store.updatePrefs { it.copy(mode = m) } } },
                onStart = { subject, cycleItemId, category ->
                    ensureNotifications()
                    scope.launch { app.engine.start(subject, cycleItemId, prefs.mode, category, request.topicId?.takeIf { request.subjectId == subject.id } ?: view.cycle.firstOrNull { it.id == cycleItemId }?.topicId) }
                },
                onStartLivre = {
                    ensureNotifications()
                    scope.launch { app.engine.startLivre(prefs.mode) }
                },
                onClose = onClose,
            )
        }
    }
}

/** A barra de cima: fechar, o selo e o título, como a tela cheia do site */
@Composable
private fun TopBar(title: String, onClose: () -> Unit, trailing: @Composable () -> Unit = {}) {
    Row(Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = onClose) { Icon(painterResource(R.drawable.ic_close), "Fechar", tint = Cores.Muted) }
        Badge(Modifier.size(28.dp))
        Text(title, style = MaterialTheme.typography.titleLarge, color = Cores.Ink, modifier = Modifier.weight(1f).padding(start = 10.dp))
        trailing()
    }
}

/**
 * A cena lo-fi do site (components/LofiScene.tsx): a estudante na mesa e, na pausa, tomando café
 * com o gato ao lado. As duas ilustrações se cruzam devagar ao trocar de etapa.
 */
@Composable
private fun LofiScene(resting: Boolean, animate: Boolean, modifier: Modifier = Modifier, overlay: @Composable BoxScope.() -> Unit = {}) {
    val pause by animateFloatAsState(if (resting) 1f else 0f, if (animate) tween(1000) else tween(0), label = "cena")
    val shape = RoundedCornerShape(24.dp)
    Box(modifier.fillMaxWidth().aspectRatio(1672f / 941f).clip(shape).border(1.dp, Color.White.copy(alpha = 0.12f), shape)) {
        Image(
            painterResource(PhoneR.drawable.lofi_study),
            contentDescription = "Uma estudante escreve de fones, com café e um gato dormindo, diante de uma janela chuvosa",
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize().alpha(1f - pause),
        )
        if (pause > 0f) {
            Image(
                painterResource(PhoneR.drawable.lofi_break),
                contentDescription = "Na pausa, a estudante descansa tomando café enquanto o gato dorme ao lado",
                contentScale = ContentScale.Crop,
                modifier = Modifier.fillMaxSize().alpha(pause),
            )
        }
        // um véu no pé da cena, para o cartão ler bem sobre a ilustração
        Box(Modifier.fillMaxSize().background(Brush.verticalGradient(0.55f to Color.Transparent, 1f to Color.Black.copy(alpha = 0.45f))))
        overlay()
    }
}

/** O cartão escuro sobre a cena (o .coado-pomodoro do site) */
@Composable
private fun SceneCard(modifier: Modifier = Modifier, content: @Composable () -> Unit) {
    Box(
        modifier
            .clip(RoundedCornerShape(16.dp))
            .background(SceneCard.copy(alpha = 0.9f))
            .border(1.dp, Color.White.copy(alpha = 0.2f), RoundedCornerShape(16.dp))
            .padding(horizontal = 12.dp, vertical = 8.dp),
    ) { content() }
}

@Composable
private fun SceneLabel(text: String, color: Color = SceneAccent) {
    Text(text.uppercase(), fontSize = 10.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.6.sp, color = color, maxLines = 1)
}

@Composable
private fun PickPane(
    view: Overview,
    prefs: LocalPrefs,
    request: TimerRequest,
    onMode: (Mode) -> Unit,
    onStart: (SubjectLite, String?, String) -> Unit,
    onStartLivre: () -> Unit,
    onClose: () -> Unit,
) {
    // "" é o pomodoro livre, sem disciplina
    var selected by rememberSaveable(request.subjectId) { mutableStateOf(request.subjectId ?: view.next?.subjectId ?: "") }
    val category = request.categoryId ?: "teoria"
    val pendingItems = view.pendingInOrder

    Column(Modifier.fillMaxSize().systemBarsPadding()) {
        TopBar("Pomodoro", onClose)
        if (view.plan == null) {
            Column(Modifier.weight(1f).fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.Center) {
                LofiScene(resting = false, animate = prefs.animations)
                Text("Sem plano de estudos ainda: o pomodoro livre roda sem disciplina.", color = Cores.Muted, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth().padding(24.dp))
                StartButton("Começar pomodoro livre", enabled = true, onClick = onStartLivre)
            }
            return@Column
        }
        LazyColumn(Modifier.weight(1f), contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            item {
                LofiScene(resting = false, animate = prefs.animations, modifier = Modifier.padding(bottom = 6.dp)) {
                    val next = view.next?.let { view.subject(it.subjectId) }
                    SceneCard(Modifier.align(Alignment.BottomStart).padding(10.dp)) {
                        Column {
                            SceneLabel(if (next != null) "Próxima do ciclo" else "Hora de focar")
                            Text(next?.name ?: (view.plan?.name ?: ""), style = MaterialTheme.typography.titleSmall, color = SceneInk, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        }
                    }
                }
            }
            item {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    ModeChip("Pomodoro", prefs.mode == Mode.POMODORO) { onMode(Mode.POMODORO) }
                    ModeChip("Cronômetro livre", prefs.mode == Mode.FREE) { onMode(Mode.FREE) }
                }
            }
            item {
                SubjectRow(subject = SubjectLite("", SEM_DISCIPLINA, ""), detail = "escolha ao registrar", progress = null, selected = selected == "", onClick = { selected = "" })
            }
            if (pendingItems.isNotEmpty()) {
                item { SectionLabel("Próximas do ciclo") }
                items(pendingItems, key = { "c" + it.id }) { item ->
                    val subject = view.subject(item.subjectId) ?: return@items
                    SubjectRow(
                        subject = subject,
                        detail = "${fmtDuration(item.studied)} de ${fmtMinutes(item.duration)}",
                        progress = (item.studied / (item.duration * 60f)).coerceIn(0f, 1f),
                        selected = selected == subject.id,
                        onClick = { selected = subject.id },
                    )
                }
            }
            item { SectionLabel("Todas as disciplinas") }
            items(view.subjects, key = { "s" + it.id }) { subject ->
                SubjectRow(subject = subject, detail = null, progress = null, selected = selected == subject.id, onClick = { selected = subject.id })
            }
        }
        val livre = selected == ""
        val subject = selected.takeIf { it.isNotEmpty() }?.let { view.subject(it) }
        StartButton(
            text = when {
                livre -> "Começar · $SEM_DISCIPLINA"
                subject != null -> "Começar · ${subject.name}"
                else -> "Escolha uma disciplina"
            },
            enabled = livre || subject != null,
            onClick = {
                if (livre) onStartLivre()
                else subject?.let { onStart(it, view.cycle.firstOrNull { c -> !c.done && c.subjectId == it.id }?.id, category) }
            },
        )
    }
}

@Composable
private fun StartButton(text: String, enabled: Boolean, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        enabled = enabled,
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(containerColor = Cores.Brand600, contentColor = Cores.Brand50, disabledContainerColor = Cores.Surface2, disabledContentColor = Cores.Muted),
        modifier = Modifier.fillMaxWidth().padding(16.dp).height(54.dp),
    ) {
        Icon(painterResource(R.drawable.ic_play), null, modifier = Modifier.size(18.dp))
        Spacer(Modifier.width(8.dp))
        Text(text, maxLines = 1, overflow = TextOverflow.Ellipsis, style = MaterialTheme.typography.labelLarge)
    }
}

@Composable
private fun ModeChip(text: String, selected: Boolean, onClick: () -> Unit) {
    FilterChip(
        selected = selected,
        onClick = onClick,
        label = { Text(text) },
        colors = FilterChipDefaults.filterChipColors(selectedContainerColor = Cores.Brand700, selectedLabelColor = Cores.Brand50, labelColor = Cores.Muted, containerColor = Cores.Surface2),
    )
}

@Composable
private fun SectionLabel(text: String) {
    Text(text.uppercase(), style = MaterialTheme.typography.labelSmall, color = Cores.Muted, modifier = Modifier.padding(top = 8.dp, bottom = 2.dp))
}

@Composable
private fun SubjectRow(subject: SubjectLite, detail: String?, progress: Float?, selected: Boolean, onClick: () -> Unit) {
    val color = parseColor(subject.color)
    Column(
        Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(if (selected) Cores.Surface2 else Cores.Surface)
            .border(1.dp, if (selected) Cores.Brand500 else Cores.Line, RoundedCornerShape(16.dp))
            .clickable(onClick = onClick)
            .padding(horizontal = 14.dp, vertical = 12.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp),
    ) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            Box(Modifier.size(12.dp).clip(CircleShape).background(color))
            Text(subject.name, style = MaterialTheme.typography.titleSmall, color = Cores.Ink, modifier = Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis)
            if (detail != null) Text(detail, style = MaterialTheme.typography.bodySmall, color = Cores.Muted)
        }
        if (progress != null) {
            Box(Modifier.fillMaxWidth().height(5.dp).clip(CircleShape).background(Cores.Line)) {
                Box(Modifier.fillMaxWidth(progress).height(5.dp).clip(CircleShape).background(color))
            }
        }
    }
}

@Composable
private fun SessionPane(state: TimerState, animate: Boolean, onToggle: () -> Unit, onSkip: () -> Unit, onFinish: () -> Unit, onClose: () -> Unit) {
    var now by remember { mutableLongStateOf(System.currentTimeMillis()) }
    LaunchedEffect(state.running, state.phase, state.segmentStartedAt) {
        now = System.currentTimeMillis()
        if (!state.running) return@LaunchedEffect
        while (true) {
            delay(1000 - System.currentTimeMillis() % 1000)
            now = System.currentTimeMillis()
        }
    }
    val free = state.mode == Mode.FREE
    val subjectColor = parseColor(state.subjectColor)
    val isBreak = state.isBreak
    val progress = if (free) 0f else state.progress(now)
    val display = if (free) fmtClock(state.elapsedMs(now)) else fmtClock(state.remainingMs(now))
    val studied = fmtDuration((state.studiedMs(now) / 1000).toInt())

    Column(Modifier.fillMaxSize().systemBarsPadding().verticalScroll(rememberScrollState()), horizontalAlignment = Alignment.CenterHorizontally) {
        TopBar(if (free) "Cronômetro" else "Pomodoro", onClose)
        LofiScene(resting = isBreak, animate = animate, modifier = Modifier.padding(horizontal = 16.dp)) {
            SceneCard(Modifier.align(Alignment.BottomStart).padding(10.dp)) {
                Column {
                    AnimatedContent(
                        targetState = manchete(state.phase, free),
                        transitionSpec = { fadeIn(tween(220)) togetherWith fadeOut(tween(120)) },
                        label = "etapa",
                    ) { SceneLabel(it) }
                    Text(
                        when {
                            !state.running -> "Em espera"
                            free || !isBreak -> "Estudando"
                            else -> "Descansando"
                        } + if (!free) " · ciclo ${state.round}/${state.rounds}" else "",
                        fontSize = 11.sp,
                        color = SceneMuted,
                    )
                }
            }
        }

        Spacer(Modifier.height(18.dp))
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(horizontal = 32.dp)) {
            Box(Modifier.size(10.dp).clip(CircleShape).background(subjectColor))
            Text(state.subjectName, style = MaterialTheme.typography.titleMedium, color = Cores.Ink, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        Text(
            display,
            style = MaterialTheme.typography.displayLarge.copy(fontSize = if (display.length > 5) 64.sp else 84.sp),
            color = if (state.running) Cores.Ink else Cores.Muted,
            modifier = Modifier.padding(top = 2.dp),
        )
        if (!free) {
            // a barra da etapa, como a tela cheia do site: estudo na cor da marca, pausa em verde
            Column(Modifier.fillMaxWidth().padding(horizontal = 32.dp)) {
                Text(
                    "${fmtClock(state.elapsedMs(now))} de ${fmtClock(state.targetMs)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = Cores.Muted,
                    textAlign = TextAlign.End,
                    modifier = Modifier.fillMaxWidth().padding(bottom = 4.dp),
                )
                Box(Modifier.fillMaxWidth().height(6.dp).clip(CircleShape).background(Color.White.copy(alpha = 0.1f))) {
                    Box(Modifier.fillMaxWidth(progress).height(6.dp).clip(CircleShape).background(if (isBreak) Cores.Ok else Cores.Brand400))
                }
            }
            RoundRings(state, progress, Modifier.padding(top = 16.dp, start = 24.dp, end = 24.dp))
        }
        Text("estudado $studied", style = MaterialTheme.typography.bodyMedium, color = Cores.Muted, modifier = Modifier.padding(top = 12.dp))
        if (!free) {
            Row(Modifier.padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                for (p in Phase.entries) {
                    val on = p == state.phase
                    Box(
                        Modifier.clip(CircleShape).background(if (on) Cores.Brand600 else Color.Transparent).border(1.dp, if (on) Cores.Brand500 else Color.White.copy(alpha = 0.2f), CircleShape).padding(horizontal = 14.dp, vertical = 5.dp),
                    ) { Text(p.label, style = MaterialTheme.typography.labelMedium, color = if (on) Cores.Brand50 else Cores.Muted) }
                }
            }
        }
        Row(horizontalArrangement = Arrangement.spacedBy(18.dp), verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 28.dp)) {
            CircleButton(R.drawable.ic_stop, "Finalizar e registrar", onFinish, size = 56.dp, color = Cores.Brand600, tint = Cores.Brand50)
            CircleButton(if (state.running) R.drawable.ic_pause else R.drawable.ic_play, if (state.running) "Pausar" else "Continuar", onToggle, size = 72.dp, color = Cores.Brand100, tint = PomodoroActivity.Overlay)
            CircleButton(R.drawable.ic_skip, "Pular etapa", onSkip, size = 56.dp, color = Color.Transparent, tint = Cores.Ink, border = true, enabled = !free)
        }
        Text(
            "Ao finalizar, o tempo estudado abre no registro.",
            style = MaterialTheme.typography.bodySmall,
            color = Cores.Muted.copy(alpha = 0.7f),
            modifier = Modifier.padding(top = 14.dp, bottom = 24.dp),
        )
    }
}

/** Um anel por rodada (o progresso dos ciclos da cena do site): feito, em andamento e por vir */
@Composable
private fun RoundRings(state: TimerState, progress: Float, modifier: Modifier = Modifier) {
    Row(modifier.horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        for (i in 1..state.rounds.coerceIn(1, 12)) {
            val value = when {
                i < state.round || (i == state.round && state.isBreak) -> 1f
                i == state.round -> progress
                else -> 0f
            }
            Box(Modifier.size(30.dp), contentAlignment = Alignment.Center) {
                Canvas(Modifier.fillMaxSize()) {
                    val w = 3.dp.toPx()
                    val inset = w / 2f
                    val arc = Size(size.width - w, size.height - w)
                    drawArc(Color.White.copy(alpha = 0.16f), 0f, 360f, false, Offset(inset, inset), arc, style = Stroke(w))
                    if (value > 0f) drawArc(if (value >= 1f) Cores.Ok else Cores.Brand300, -90f, 360f * value, false, Offset(inset, inset), arc, style = Stroke(w, cap = StrokeCap.Round))
                }
                if (value >= 1f) Icon(painterResource(R.drawable.ic_check), null, tint = Cores.Ok, modifier = Modifier.size(13.dp))
                else Text("$i", fontSize = 11.sp, color = if (i == state.round) Cores.Ink else Cores.Muted)
            }
        }
    }
}

@Composable
private fun CircleButton(icon: Int, label: String, onClick: () -> Unit, size: Dp, color: Color, tint: Color, border: Boolean = false, enabled: Boolean = true) {
    Box(
        contentAlignment = Alignment.Center,
        modifier = Modifier
            .size(size)
            .alpha(if (enabled) 1f else 0.4f)
            .clip(CircleShape)
            .background(color)
            .then(if (border) Modifier.border(1.dp, Color.White.copy(alpha = 0.2f), CircleShape) else Modifier)
            .clickable(enabled = enabled, onClickLabel = label, onClick = onClick),
    ) { Icon(painterResource(icon), label, tint = tint, modifier = Modifier.size(size * 0.42f)) }
}

@Composable
private fun RegisterPane(draft: Draft, view: Overview, onSave: (Draft, String, Int, Int, Boolean, Boolean) -> Unit, onDiscard: () -> Unit) {
    var picked by rememberSaveable { mutableStateOf<String?>(null) }
    var category by rememberSaveable { mutableStateOf(draft.categoryId) }
    var hits by rememberSaveable { mutableIntStateOf(0) }
    var misses by rememberSaveable { mutableIntStateOf(0) }
    var counts by rememberSaveable { mutableStateOf(true) }
    var reviews by rememberSaveable { mutableStateOf(false) }
    var confirmDiscard by rememberSaveable { mutableStateOf(false) }
    val subject = picked?.let { view.subject(it) }
    if (draft.semDisciplina && subject == null) {
        PickSubjectPane(draft, view, onPick = { picked = it.id }, onDiscard = onDiscard)
        return
    }
    val final = if (subject != null) draft.comDisciplina(subject) else draft
    val color = parseColor(final.subjectColor)
    val intervals = view.snapshot?.reviewIntervals.orEmpty()

    Column(Modifier.fillMaxSize().systemBarsPadding().verticalScroll(rememberScrollState()).padding(bottom = 24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        TopBar("Registrar estudo", onClose = { confirmDiscard = true })
        LofiScene(resting = true, animate = false, modifier = Modifier.padding(horizontal = 16.dp)) {
            SceneCard(Modifier.align(Alignment.BottomStart).padding(10.dp)) {
                Column {
                    SceneLabel("Sessão encerrada")
                    Text(fmtDuration(draft.seconds), style = MaterialTheme.typography.headlineSmall, color = SceneInk)
                }
            }
        }
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(top = 16.dp, start = 24.dp, end = 24.dp)) {
            Box(Modifier.size(10.dp).clip(CircleShape).background(color))
            Text(final.subjectName, style = MaterialTheme.typography.titleMedium, color = Cores.Ink, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        Text("${Dates.fmtDate(Dates.dateOf(draft.startedAt))} · ${Dates.timeOf(draft.startedAt)}" + if (draft.rounds > 0) " · ${draft.rounds} ${if (draft.rounds == 1) "pomodoro" else "pomodoros"}" else "", style = MaterialTheme.typography.bodySmall, color = Cores.Muted)

        Column(Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            SectionLabel("Categoria")
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.fillMaxWidth().horizontalScroll(rememberScrollState())) {
                view.categories.forEach { c -> ModeChip(c.name, category == c.id) { category = c.id } }
            }
            SectionLabel("Questões")
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Counter("Acertos", hits, Modifier.weight(1f)) { hits = it }
                Counter("Erros", misses, Modifier.weight(1f)) { misses = it }
            }
            SwitchRow("Conta no ciclo", counts) { counts = it }
            SwitchRow("Agendar revisões" + if (intervals.isNotEmpty()) " (${intervals.joinToString(", ")} dias)" else "", reviews, enabled = intervals.isNotEmpty()) { reviews = it }
            Button(
                onClick = { onSave(final, category, hits, misses, counts, reviews) },
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Cores.Brand600, contentColor = Cores.Brand50),
                modifier = Modifier.fillMaxWidth().height(54.dp),
            ) { Text("Salvar estudo", style = MaterialTheme.typography.labelLarge) }
            if (confirmDiscard) {
                Text("Descartar o tempo em andamento?", color = Cores.Muted, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth())
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedButton(onClick = { confirmDiscard = false }, modifier = Modifier.weight(1f)) { Text("Voltar") }
                    Button(onClick = onDiscard, colors = ButtonDefaults.buttonColors(containerColor = Cores.Bad, contentColor = Cores.Bg), modifier = Modifier.weight(1f)) { Text("Descartar") }
                }
            } else {
                TextButton(onClick = { confirmDiscard = true }, modifier = Modifier.fillMaxWidth()) { Text("Descartar", color = Cores.Bad) }
            }
        }
    }
}

/** Depois do pomodoro livre: em qual disciplina o tempo entra, ou encerrar sem virar estudo */
@Composable
private fun PickSubjectPane(draft: Draft, view: Overview, onPick: (SubjectLite) -> Unit, onDiscard: () -> Unit) {
    Column(Modifier.fillMaxSize().systemBarsPadding()) {
        TopBar("Registrar estudo", onClose = onDiscard)
        LazyColumn(Modifier.weight(1f), contentPadding = PaddingValues(start = 16.dp, end = 16.dp, bottom = 16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            item {
                LofiScene(resting = true, animate = false) {
                    SceneCard(Modifier.align(Alignment.BottomStart).padding(10.dp)) {
                        Column {
                            SceneLabel("Pomodoro livre")
                            Text(fmtDuration(draft.seconds), style = MaterialTheme.typography.headlineSmall, color = SceneInk)
                        }
                    }
                }
            }
            if (view.plan != null && view.subjects.isNotEmpty()) {
                item { SectionLabel("Registrar em qual disciplina?") }
                items(view.subjects, key = { "s" + it.id }) { subject ->
                    SubjectRow(subject = subject, detail = null, progress = null, selected = false, onClick = { onPick(subject) })
                }
            } else {
                item { Text("Sem disciplinas no plano ativo: o tempo não vira estudo.", color = Cores.Muted, textAlign = TextAlign.Center, modifier = Modifier.fillMaxWidth().padding(24.dp)) }
            }
        }
        OutlinedButton(onClick = onDiscard, shape = RoundedCornerShape(16.dp), modifier = Modifier.fillMaxWidth().padding(16.dp).height(52.dp)) {
            Text("Encerrar sem registrar", color = Cores.Ink, style = MaterialTheme.typography.labelLarge)
        }
    }
}

@Composable
private fun Counter(label: String, value: Int, modifier: Modifier = Modifier, onChange: (Int) -> Unit) {
    Column(modifier.clip(RoundedCornerShape(16.dp)).background(Cores.Surface).padding(12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(label, style = MaterialTheme.typography.labelMedium, color = Cores.Muted)
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            CircleButton(R.drawable.ic_remove, "menos", { onChange((value - 1).coerceAtLeast(0)) }, size = 36.dp, color = Cores.Surface2, tint = Cores.Ink, enabled = value > 0)
            Text(value.toString(), style = MaterialTheme.typography.headlineSmall, color = Cores.Ink)
            CircleButton(R.drawable.ic_add, "mais", { onChange(value + 1) }, size = 36.dp, color = Cores.Surface2, tint = Cores.Ink)
        }
    }
}

@Composable
private fun SwitchRow(label: String, checked: Boolean, enabled: Boolean = true, onChange: (Boolean) -> Unit) {
    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Cores.Surface).padding(horizontal = 14.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(label, style = MaterialTheme.typography.bodyMedium, color = if (enabled) Cores.Ink else Cores.Muted, modifier = Modifier.weight(1f))
        Switch(checked = checked, onCheckedChange = onChange, enabled = enabled)
    }
}

@Composable
private fun SavedPane(view: Overview, onDone: () -> Unit) {
    Column(Modifier.fillMaxSize().systemBarsPadding().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
        LofiScene(resting = true, animate = false)
        Text("Estudo registrado", style = MaterialTheme.typography.headlineSmall, color = Cores.Ink, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 20.dp))
        Text("hoje: ${fmtDuration(view.todayTotals.seconds)}" + (view.constancy.current.takeIf { it > 1 }?.let { " · $it dias seguidos" } ?: ""), style = MaterialTheme.typography.bodyMedium, color = Cores.Muted, modifier = Modifier.padding(top = 6.dp))
        Spacer(Modifier.height(24.dp))
        Button(onClick = onDone, shape = RoundedCornerShape(16.dp), colors = ButtonDefaults.buttonColors(containerColor = Cores.Brand600, contentColor = Cores.Brand50)) { Text("Voltar ao Coado") }
    }
}
