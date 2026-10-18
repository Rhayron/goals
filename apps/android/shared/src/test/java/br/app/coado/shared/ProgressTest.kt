package br.app.coado.shared

import br.app.coado.shared.model.CycleItem
import br.app.coado.shared.model.Dates
import br.app.coado.shared.model.Overview
import br.app.coado.shared.model.Pending
import br.app.coado.shared.model.PlanLite
import br.app.coado.shared.model.PlanningConfigLite
import br.app.coado.shared.model.PlanningLite
import br.app.coado.shared.model.Snapshot
import br.app.coado.shared.model.Study
import br.app.coado.shared.model.SubjectLite
import br.app.coado.shared.model.WatchStudy
import br.app.coado.shared.model.constancy
import br.app.coado.shared.model.cycleProgress
import br.app.coado.shared.model.fmtClock
import br.app.coado.shared.model.fmtDuration
import br.app.coado.shared.model.json
import br.app.coado.shared.model.nextSessions
import br.app.coado.shared.model.weeklySchedule
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

/** As mesmas contas do site (apps/web/src/lib/utils.ts) */
class ProgressTest {
    private fun study(id: String, subject: String, date: String, seconds: Int, time: String? = null, counts: Boolean = true) =
        WatchStudy(id = id, subjectId = subject, categoryId = "teoria", date = date, time = time, duration = seconds, countInPlanning = counts)

    private val planning = PlanningLite(
        cycle = listOf(CycleItem("c1", "mat", 60), CycleItem("c2", "por", 30), CycleItem("c3", "mat", 45)),
        cycleStartedAt = "2026-10-01",
    )

    @Test
    fun `o estudo enche o primeiro item incompleto da disciplina e o excedente vai para o último`() {
        val items = cycleProgress(planning, listOf(study("a", "mat", "2026-10-02", 5400), study("b", "mat", "2026-10-03", 3600)))
        assertEquals(listOf(3600, 0, 5400), items.map { it.studied })
        assertEquals(listOf(true, false, true), items.map { it.done })
    }

    @Test
    fun `estudos antes do ciclo ou fora do planejamento não contam`() {
        val items = cycleProgress(planning, listOf(study("a", "mat", "2026-09-30", 3600), study("b", "por", "2026-10-02", 1800, counts = false)))
        assertEquals(listOf(0, 0, 0), items.map { it.studied })
    }

    @Test
    fun `a ordem é por data e hora`() {
        val items = cycleProgress(planning, listOf(study("b", "mat", "2026-10-02", 1800, "10:00"), study("a", "mat", "2026-10-02", 2700, "08:00")))
        assertEquals(3600, items[0].studied)
        assertEquals(900, items[2].studied)
    }

    @Test
    fun `constância conta a sequência até hoje ou até ontem`() {
        val c = constancy(listOf("2026-10-10", "2026-10-11", "2026-10-12", "2026-10-01", "2026-10-02"), "2026-10-12")
        assertEquals(3, c.current)
        assertEquals(3, c.record)
        assertEquals(0, c.daysSinceLast)

        val ontem = constancy(listOf("2026-10-10", "2026-10-11"), "2026-10-12")
        assertEquals(2, ontem.current)
        assertEquals(1, ontem.daysSinceLast)

        val quebrou = constancy(listOf("2026-10-05", "2026-10-06", "2026-10-07", "2026-10-09"), "2026-10-12")
        assertEquals(0, quebrou.current)
        assertEquals(3, quebrou.record)
        assertEquals(3, quebrou.daysSinceLast)

        assertNull(constancy(emptyList(), "2026-10-12").daysSinceLast)
    }

    @Test
    fun `a semana começa no domingo`() {
        assertEquals("2026-10-11", Dates.startOfWeek("2026-10-12")) // segunda → domingo anterior
        assertEquals("2026-10-11", Dates.startOfWeek("2026-10-11")) // domingo
        assertEquals("2026-10-11", Dates.startOfWeek("2026-10-17")) // sábado
        assertEquals(0, Dates.weekday("2026-10-11"))
        assertEquals(6, Dates.weekday("2026-10-17"))
    }

    @Test
    fun `formatação como no site`() {
        assertEquals("1h30min", fmtDuration(5400))
        assertEquals("45min", fmtDuration(2700))
        assertEquals("0min", fmtDuration(0))
        assertEquals("24:59", fmtClock(1_499_000))
        assertEquals("25:00", fmtClock(1_500_000))
        assertEquals("1:05:09", fmtClock(3_909_000))
        assertEquals("00:00", fmtClock(0))
    }

    @Test
    fun `a visão combinada soma o pendente sem contar duas vezes`() {
        val snapshot = Snapshot(
            today = "2026-10-12",
            plan = PlanLite("p1", "Petrobras"),
            subjects = listOf(SubjectLite("mat", "Matemática", "#c08f5d"), SubjectLite("por", "Português", "#b8cfc6")),
            planning = planning,
            studies = listOf(study("a", "mat", "2026-10-12", 1800)),
            studiedDates = listOf("2026-10-12"),
        )
        val pendingStudy = Study(id = "w1", planId = "p1", subjectId = "por", categoryId = "teoria", date = "2026-10-12", duration = 900, createdAt = "2026-10-12T10:00:00Z")
        val dup = pendingStudy.copy(id = "a", subjectId = "mat", duration = 99_999)
        val view = Overview(snapshot, Pending(listOf(pendingStudy, dup)), "2026-10-12")
        assertEquals(2, view.studies.size)
        assertEquals(2700, view.todayTotals.seconds)
        assertEquals("c1", view.next?.id)
        assertEquals(1800, view.cycle[0].studied)
        assertEquals(900, view.cycle[1].studied)
        assertFalse(view.cycleDone)
        assertEquals(1, view.constancy.current)
    }

    @Test
    fun `o JSON do recorte ignora campos novos e omite opcionais`() {
        val snap = json.decodeFromString<Snapshot>("""{"serverTime":"x","today":"2026-10-12","plan":null,"subjects":[],"categories":[],"timerPrefs":{"pomodoroStudy":50,"pomodoroShort":10,"pomodoroLong":20,"pomodoroRounds":2,"countdown":60,"sound":false},"reviewIntervals":[1,7],"planning":null,"studies":[{"id":"a","subjectId":"s","categoryId":"teoria","date":"2026-10-12","duration":60,"hits":0,"misses":0,"countInPlanning":true}],"studiedDates":[],"reviewsDue":0,"novo":1}""")
        assertEquals(50, snap.timerPrefs.pomodoroStudy)
        assertNull(snap.studies[0].time)
        val study = Study(id = "a", planId = "p", subjectId = "s", categoryId = "teoria", date = "2026-10-12", duration = 60, createdAt = "2026-10-12T00:00:00Z")
        val text = json.encodeToString(Study.serializer(), study)
        assertFalse(text.contains("topicId"))
        assertTrue(text.contains("\"pages\":[]"))
    }

    // ---------- modo semanal e a opção de empurrar (os mesmos casos de apps/web/src/lib/next-sessions.test.ts) ----------

    /** seg, ter e qua, 3 sessões de 60 min por dia: a1-a3 na segunda, b1-b3 na terça, c1-c3 na quarta */
    private fun semanal(type: String, carryOver: Boolean = true) = PlanningLite(
        type = type,
        cycle = listOf("a1", "a2", "a3", "b1", "b2", "b3", "c1", "c2", "c3").map { CycleItem(it, it, 60) },
        cycleStartedAt = "2026-10-12",
        config = PlanningConfigLite(weeklyMinutes = 540, days = listOf(false, true, true, true, false, false, false), carryOver = carryOver),
    )

    /** segunda feita só pela metade (a1) */
    private fun ordem(p: PlanningLite, hoje: String) =
        nextSessions(p, cycleProgress(p, listOf(study("s1", "a1", "2026-10-12", 3600))), hoje).map { it.id }

    @Test
    fun `a grade semanal distribui a sequência pelos dias marcados`() {
        val g = weeklySchedule(semanal("weekly"))
        assertEquals(listOf(listOf("a1", "a2", "a3"), listOf("b1", "b2", "b3"), listOf("c1", "c2", "c3")), (1..3).map { g[it] })
    }

    @Test
    fun `no ciclo a ordem é a da sequência`() {
        assertEquals("a2", ordem(semanal("cycle", carryOver = false), "2026-10-14").first())
    }

    @Test
    fun `semanal empurrando a sessão que ficou de segunda vem primeiro`() {
        assertEquals(listOf("a2", "a3", "b1"), ordem(semanal("weekly"), "2026-10-14").take(3))
    }

    @Test
    fun `semanal sem empurrar primeiro as de hoje depois as demais`() {
        assertEquals(listOf("c1", "c2", "c3", "a2", "a3", "b1", "b2", "b3"), ordem(semanal("weekly", carryOver = false), "2026-10-14"))
        assertEquals(listOf("b1", "b2", "b3", "a2"), ordem(semanal("weekly", carryOver = false), "2026-10-13").take(4))
        assertEquals("a2", ordem(semanal("weekly", carryOver = false), "2026-10-17").first())
    }

    @Test
    fun `servidor antigo sem config lê o planejamento e empurra`() {
        val p = json.decodeFromString(PlanningLite.serializer(), """{"type":"weekly","cycle":[],"cycleStartedAt":"2026-10-12"}""")
        assertNull(p.config)
        val q = json.decodeFromString(PlanningLite.serializer(), """{"type":"weekly","cycle":[],"cycleStartedAt":"2026-10-12","config":{"weeklyMinutes":540,"days":[false,true,true,true,false,false,false],"carryOver":false}}""")
        assertFalse(q.config!!.carryOver)
    }
}
