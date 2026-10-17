package br.app.coado.watch.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.compositionLocalOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation3.runtime.NavKey
import androidx.navigation3.runtime.entryProvider
import androidx.navigation3.runtime.rememberNavBackStack
import androidx.navigation3.ui.NavDisplay
import androidx.wear.compose.material3.AppScaffold
import androidx.wear.compose.material3.ColorScheme
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.TimeText
import androidx.wear.compose.material3.Typography
import androidx.wear.compose.navigation3.rememberSwipeDismissableSceneStrategy
import br.app.coado.shared.model.Dates
import br.app.coado.shared.model.Overview
import br.app.coado.shared.ui.Coffee
import br.app.coado.shared.ui.Nunito
import br.app.coado.watch.CoadoWatchApp
import kotlinx.coroutines.launch
import kotlinx.serialization.Serializable

/** O estado do modo ambiente, vindo da MainActivity */
data class Ambient(val on: Boolean = false, val lowBit: Boolean = false, val burnIn: Boolean = false, val tick: Int = 0)

/** O que o teclado do relógio edita */
enum class InputField(val label: String) {
    CODE("Código de pareamento"),
    SERVER("Endereço do servidor"),
}

val LocalAmbient = compositionLocalOf { Ambient() }
val LocalAnimations = compositionLocalOf { true }

@Serializable data object HomeRoute : NavKey
@Serializable data object SubjectsRoute : NavKey
@Serializable data object TimerRoute : NavKey
@Serializable data object FinishRoute : NavKey
@Serializable data object SavedRoute : NavKey
@Serializable data object ProgressRoute : NavKey
@Serializable data object SettingsRoute : NavKey

private val CoffeeScheme = ColorScheme(
    primary = Coffee.Brand300,
    primaryDim = Coffee.Brand400,
    primaryContainer = Coffee.Brand700,
    onPrimary = Coffee.Bg,
    onPrimaryContainer = Coffee.Brand100,
    secondary = Coffee.Ok,
    secondaryDim = Color(0xFF6F9A73),
    secondaryContainer = Color(0xFF2F3E31),
    onSecondary = Coffee.Bg,
    onSecondaryContainer = Color(0xFFCFE6D0),
    tertiary = Coffee.Warn,
    tertiaryDim = Color(0xFFC99A3E),
    tertiaryContainer = Color(0xFF4A3A1A),
    onTertiary = Coffee.Bg,
    onTertiaryContainer = Color(0xFFF3DFB0),
    surfaceContainerLow = Coffee.Surface,
    surfaceContainer = Coffee.Surface2,
    surfaceContainerHigh = Coffee.Line,
    onSurface = Coffee.Ink,
    onSurfaceVariant = Coffee.Muted,
    outline = Coffee.Line,
    outlineVariant = Coffee.Kraft,
    background = Coffee.Bg,
    onBackground = Coffee.Ink,
    error = Coffee.Bad,
    errorDim = Color(0xFFB86E6A),
    errorContainer = Color(0xFF4A2A28),
    onError = Coffee.Bg,
    onErrorContainer = Color(0xFFF3C9C6),
)

@Composable
fun CoadoWatchRoot(
    app: CoadoWatchApp,
    ambient: Ambient,
    notice: String,
    edit: (InputField) -> Unit,
    ensureNotifications: () -> Unit,
) {
    val loaded by app.store.loaded.collectAsStateWithLifecycle()
    val snapshot by app.store.snapshot.collectAsStateWithLifecycle()
    val pending by app.store.pending.collectAsStateWithLifecycle()
    val prefs by app.store.prefs.collectAsStateWithLifecycle()
    val timer by app.store.timer.collectAsStateWithLifecycle()
    val draft by app.store.draft.collectAsStateWithLifecycle()
    val syncStatus by app.sync.status.collectAsStateWithLifecycle()
    val today = remember(snapshot, timer.active) { Dates.today() }
    val view = remember(snapshot, pending, today) { Overview(snapshot, pending, today) }
    val scope = rememberCoroutineScope()
    val backStack = rememberNavBackStack(HomeRoute)

    // a sessão em andamento (ou encerrada à espera do registro) toma a frente.
    // Só este efeito mexe na pilha por causa do estado do timer: os botões apenas mudam o estado.
    // A pilha nunca fica vazia (o NavDisplay não aceita), então a base (Início) fica sempre.
    LaunchedEffect(timer.active, draft) {
        fun pop() {
            if (backStack.size > 1) backStack.removeAt(backStack.lastIndex)
        }
        val top = backStack.lastOrNull()
        when {
            draft != null && top != FinishRoute -> {
                if (top == TimerRoute) pop()
                backStack.add(FinishRoute)
            }
            draft == null && timer.active && top != TimerRoute && top != FinishRoute -> backStack.add(TimerRoute)
            draft == null && !timer.active && top == TimerRoute -> pop()
            draft == null && top == FinishRoute -> pop()
        }
    }

    MaterialTheme(colorScheme = CoffeeScheme, typography = Typography(defaultFontFamily = Nunito)) {
        CompositionLocalProvider(LocalAmbient provides ambient, LocalAnimations provides (prefs.animations && !ambient.on)) {
            Box(Modifier.fillMaxSize().background(Coffee.Bg)) {
                AppScaffold(timeText = { if (!ambient.on) TimeText() }) {
                    if (!loaded) {
                        LoadingScreen()
                    } else {
                        NavDisplay(
                            backStack = backStack,
                            sceneStrategies = listOf(rememberSwipeDismissableSceneStrategy()),
                            entryProvider = entryProvider {
                                entry<HomeRoute> {
                                    HomeScreen(
                                        view = view,
                                        prefs = prefs,
                                        pendingCount = pending.studies.size,
                                        syncStatus = syncStatus,
                                        timerActive = timer.active,
                                        onStartNext = { item ->
                                            val subject = view.subject(item.subjectId) ?: return@HomeScreen
                                            ensureNotifications()
                                            scope.launch { app.engine.start(subject, item.id, prefs.mode, topicId = item.topicId) }
                                        },
                                        onSubjects = { backStack.add(SubjectsRoute) },
                                        onProgress = { backStack.add(ProgressRoute) },
                                        onSettings = { backStack.add(SettingsRoute) },
                                        onTimer = { backStack.add(TimerRoute) },
                                        onSync = { scope.launch { app.sync.syncNow() } },
                                    )
                                }
                                entry<SubjectsRoute> {
                                    SubjectsScreen(
                                        view = view,
                                        mode = prefs.mode,
                                        onMode = { m -> scope.launch { app.store.updatePrefs { it.copy(mode = m) } } },
                                        onStart = { subject, cycleItemId ->
                                            ensureNotifications()
                                            scope.launch { app.engine.start(subject, cycleItemId, prefs.mode, topicId = view.cycle.firstOrNull { it.id == cycleItemId }?.topicId) }
                                            if (backStack.size > 1) backStack.removeAt(backStack.lastIndex)
                                        },
                                    )
                                }
                                entry<TimerRoute> {
                                    TimerScreen(
                                        state = timer,
                                        onToggle = { scope.launch { app.engine.toggle() } },
                                        onSkip = { scope.launch { app.engine.skip() } },
                                        // com menos de 1 min não há o que registrar: o timer zera e o efeito acima fecha a tela
                                        onFinish = { scope.launch { app.engine.finish() } },
                                    )
                                }
                                entry<FinishRoute> {
                                    val d = draft
                                    if (d != null) {
                                        FinishScreen(
                                            draft = d,
                                            view = view,
                                            onSave = { category, hits, misses, counts, reviews ->
                                                scope.launch {
                                                    runCatching { app.engine.register(d, category, hits, misses, counts, reviews) }
                                                    backStack.add(SavedRoute)
                                                }
                                            },
                                            onDiscard = { scope.launch { app.engine.discard() } },
                                        )
                                    }
                                }
                                entry<SavedRoute> {
                                    SavedScreen(view = view, pendingCount = pending.studies.size) {
                                        while (backStack.size > 1) backStack.removeAt(backStack.lastIndex)
                                    }
                                }
                                entry<ProgressRoute> { ProgressScreen(view = view) }
                                entry<SettingsRoute> {
                                    SettingsScreen(app = app, prefs = prefs, view = view, syncStatus = syncStatus, notice = notice, edit = edit)
                                }
                            },
                        )
                    }
                }
                if (ambient.on) AmbientScreen(timer, ambient)
            }
        }
    }
}
