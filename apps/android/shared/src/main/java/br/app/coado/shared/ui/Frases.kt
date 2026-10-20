package br.app.coado.shared.ui

import br.app.coado.shared.timer.Phase

/**
 * A voz de cada paleta (apps/web/src/lib/frases.ts). O produto continua Coado; o que muda é o tom.
 * `cafe` é o tema de café; as outras paletas são temas sem café, cada uma com a própria frase.
 */
private val TAGLINES = mapOf(
    "cafe" to "devagar, que o café coa.",
    "grafite" to "sem enfeite, só o próximo bloco.",
    "oceano" to "uma maré de cada vez.",
    "floresta" to "sombra, silêncio, mais uma página.",
    "ameixa" to "calmo, e no seu ritmo.",
    "magenta" to "aceso, mas sem pressa.",
)

/** A frase da paleta em uso. Lida na composição, acompanha a troca de paleta. */
val tagline: String get() = TAGLINES[Cores.paleta.id] ?: TAGLINES.getValue("cafe")

/** O título da etapa na cena do pomodoro (components/home/PomodoroScene.tsx); café só no tema de café */
fun manchete(phase: Phase, livre: Boolean = false): String = when {
    livre -> "Cronômetro livre"
    phase == Phase.STUDY -> "Hora de focar"
    phase == Phase.SHORT -> if (Cores.paleta.id == "cafe") "Pausa para um café" else "Pausa curta"
    else -> "Respira, pausa longa"
}
