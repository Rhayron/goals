package br.app.coado.watch.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material3.Icon
import androidx.wear.compose.material3.Text
import br.app.coado.shared.R
import br.app.coado.shared.model.Dates
import br.app.coado.shared.model.Overview
import br.app.coado.shared.model.fmtDuration
import br.app.coado.shared.model.fmtMinutes
import br.app.coado.shared.model.pct
import br.app.coado.shared.ui.Coffee
import br.app.coado.shared.ui.CoffeeType
import br.app.coado.shared.ui.Donut
import br.app.coado.shared.ui.parseColor

/** Os cartões da home do site que cabem no pulso: ciclo, constância, meta semanal, prova, revisões */
@Composable
fun ProgressScreen(view: Overview) {
    val c = view.constancy
    val goal = view.plan?.weeklyGoal

    WheelScreen {
        if (view.cycle.isNotEmpty()) {
            item {
                val planned = view.plannedSeconds.toLong()
                val studied = view.cycleStudiedSeconds.toLong()
                Box(Modifier.size(110.dp).padding(top = 6.dp), contentAlignment = Alignment.Center) {
                    Donut(
                        Modifier.size(104.dp),
                        slices = view.cycle.map { parseColor(view.subjectColor(it.subjectId)).let { col -> (if (it.done) col else col.copy(alpha = 0.45f)) to it.duration.toFloat() } },
                        thickness = 11.dp,
                    )
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Label("ciclo")
                        Text("${pct(studied, planned)}%", style = CoffeeType.numeral, color = Coffee.Ink)
                    }
                }
            }
            note("${view.cycle.count { it.done }} de ${view.cycle.size} sessões · ${fmtDuration(view.cycleStudiedSeconds)} de ${fmtMinutes(view.plannedSeconds / 60)}")
            view.snapshot?.planning?.completedCycles?.takeIf { it > 0 }?.let { note("$it ${if (it == 1) "ciclo completo" else "ciclos completos"}") }
        }

        section("Constância")
        item {
            val today = view.today
            val start = Dates.startOfWeek(today)
            Row(Modifier.fillMaxWidth().padding(horizontal = 10.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                for (i in 0 until 7) {
                    val d = Dates.addDays(start, i.toLong())
                    val studied = d in view.studiedDates
                    val future = d > today
                    val isToday = d == today
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.alpha(if (future) 0.4f else 1f)) {
                        Text(Dates.WEEKDAYS[i].take(1), style = CoffeeType.label.copy(fontSize = 9.sp), color = if (isToday) Coffee.Brand300 else Coffee.Muted)
                        Box(
                            Modifier
                                .padding(top = 2.dp)
                                .size(20.dp)
                                .clip(RoundedCornerShape(6.dp))
                                .background(
                                    when {
                                        studied -> Coffee.Ok.copy(alpha = 0.22f)
                                        future || isToday -> Coffee.Surface2
                                        else -> Coffee.Bad.copy(alpha = 0.15f)
                                    },
                                )
                                .then(if (isToday && !studied) Modifier.border(1.dp, Coffee.Brand400, RoundedCornerShape(6.dp)) else Modifier),
                            contentAlignment = Alignment.Center,
                        ) {
                            if (studied) Icon(painterResource(R.drawable.ic_check), null, tint = Coffee.Ok, modifier = Modifier.size(12.dp))
                            else if (!future && !isToday) Icon(painterResource(R.drawable.ic_close), null, tint = Coffee.Bad, modifier = Modifier.size(10.dp))
                        }
                    }
                }
            }
        }
        note(
            when {
                c.daysSinceLast == null -> "Nenhum estudo registrado ainda."
                c.current > 0 -> "🔥 ${c.current} ${if (c.current == 1) "dia" else "dias"} seguidos · recorde ${c.record}"
                else -> "${c.daysSinceLast} ${if (c.daysSinceLast == 1) "dia" else "dias"} sem estudar · recorde ${c.record}"
            },
        )

        if (goal != null && (goal.minutes > 0 || goal.questions > 0)) {
            section("Meta da semana")
            item {
                Column(Modifier.fillMaxWidth().padding(horizontal = 14.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    if (goal.minutes > 0) {
                        GoalRow("horas", fmtDuration(view.weekTotals.seconds), fmtMinutes(goal.minutes), view.weekTotals.seconds / (goal.minutes * 60f))
                    }
                    if (goal.questions > 0) {
                        GoalRow("questões", view.weekTotals.questions.toString(), goal.questions.toString(), view.weekTotals.questions / goal.questions.toFloat())
                    }
                }
            }
        }

        val exam = view.daysToExam
        if (exam != null || (view.snapshot?.reviewsDue ?: 0) > 0) {
            section("Agenda")
            if (exam != null) {
                item {
                    Pill(
                        title = when {
                            exam > 1 -> "Faltam $exam dias"
                            exam == 1 -> "A prova é amanhã"
                            exam == 0 -> "A prova é hoje! 🍀"
                            else -> "A prova foi há ${-exam} dias"
                        },
                        subtitle = "${view.plan?.name} · ${Dates.fmtDate(view.plan?.examDate ?: view.today)}",
                    )
                }
            }
            val due = view.snapshot?.reviewsDue ?: 0
            if (due > 0) item { Pill("$due ${if (due == 1) "revisão pendente" else "revisões pendentes"}", subtitle = "faça no site ou no celular") }
        }
        gap(12.dp)
    }
}

@Composable
private fun GoalRow(label: String, current: String, target: String, value: Float) {
    Column(verticalArrangement = Arrangement.spacedBy(3.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.Bottom) {
            Text(current, style = CoffeeType.subtitle, color = Coffee.Ink)
            Text("/ $target $label", style = CoffeeType.bodySmall, color = Coffee.Muted, textAlign = TextAlign.End)
        }
        Bar(value, color = if (value >= 1f) Coffee.Ok else Coffee.Brand500)
    }
}
