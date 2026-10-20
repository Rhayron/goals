package br.app.coado.phone.ui

import br.app.coado.shared.Marca
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import br.app.coado.phone.R
import br.app.coado.shared.model.AuthConfig
import br.app.coado.shared.ui.Badge
import br.app.coado.shared.ui.Cores
import br.app.coado.shared.ui.Fraunces
import br.app.coado.shared.ui.tagline
import java.time.LocalTime

/** As saudações da entrada do site (pages/Login.tsx) */
private fun moment(): Pair<String, String> {
    val h = LocalTime.now().hour
    return when {
        h < 5 -> "Ainda acordado?" to "Madrugada rende revisão, mas o sono também conta."
        h < 12 -> "Bom dia!" to "De manhã cabe o conteúdo mais pesado."
        h < 18 -> "Boa tarde." to "Ainda dá tempo de mais um bloco de estudos."
        else -> "Boa noite." to "Uma sessão curta hoje já conta."
    }
}

/** O selo e o nome, como o Logo do site */
@Composable
fun Logo(modifier: Modifier = Modifier, color: Color = MaterialTheme.colorScheme.onBackground, size: Int = 40) {
    Row(modifier, verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Badge(Modifier.size(size.dp))
        Text(Marca.SLUG, fontFamily = Fraunces, fontWeight = FontWeight.Bold, fontSize = (size * 0.6f).sp, color = color)
    }
}

/**
 * A tela de entrada do site, nativa: a cena lo-fi, a saudação e o login com o Google pelo aparelho.
 * Sem o Google (aparelho sem Play Services, cliente Android ainda não cadastrado), o código de
 * Configurações → Relógio do site também abre a conta aqui.
 */
@Composable
fun LoginScreen(
    config: AuthConfig?,
    configError: String?,
    busy: Boolean,
    error: String?,
    server: String,
    devBuild: Boolean,
    onGoogle: () -> Unit,
    onCode: (code: String) -> Unit,
    onDev: (name: String) -> Unit,
    onServer: (String) -> Unit,
    onRetry: () -> Unit,
) {
    val (hello, line) = moment()
    val dark = isSystemInDarkTheme()
    val colors = MaterialTheme.colorScheme
    var showServer by rememberSaveable { mutableStateOf(false) }
    var serverDraft by rememberSaveable { mutableStateOf(server) }
    var showCode by rememberSaveable { mutableStateOf(false) }
    var code by rememberSaveable { mutableStateOf("") }
    var name by rememberSaveable { mutableStateOf("Visitante") }

    Column(Modifier.fillMaxSize().background(colors.background).verticalScroll(rememberScrollState())) {
        // a cena do site (study-scene-background), com a tagline da paleta
        Column(
            Modifier
                .fillMaxWidth()
                .background(
                    if (dark) Brush.linearGradient(listOf(Color(0xFF242C32), Color(0xFF2A2525), Color(0xFF1B1719)))
                    else Brush.linearGradient(listOf(Color(0xFFE5E9DB), Color(0xFFEFE4D4), Color(0xFFDDD0BD))),
                )
                .systemBarsPadding()
                .padding(start = 24.dp, end = 24.dp, top = 20.dp, bottom = 22.dp),
        ) {
            Text(
                Marca.NOME.uppercase(),
                fontSize = 11.sp,
                fontWeight = FontWeight.ExtraBold,
                letterSpacing = 2.6.sp,
                color = if (dark) Cores.Brand200 else Cores.Brand800,
            )
            Text(tagline, fontFamily = Fraunces, fontStyle = FontStyle.Italic, fontSize = 20.sp, color = colors.onBackground, modifier = Modifier.padding(top = 4.dp, bottom = 12.dp))
            Image(
                painterResource(R.drawable.lofi_study),
                contentDescription = "Uma estudante escreve de fones, com café e um gato dormindo, diante de uma janela chuvosa",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(1672f / 941f)
                    .clip(RoundedCornerShape(22.dp))
                    .border(1.dp, Cores.Brand700.copy(alpha = 0.2f), RoundedCornerShape(22.dp)),
            )
        }

        Column(Modifier.fillMaxWidth().padding(horizontal = 24.dp, vertical = 28.dp)) {
            Logo()
            Text(hello, fontFamily = Fraunces, fontStyle = FontStyle.Italic, fontSize = 18.sp, color = colors.onSurfaceVariant, modifier = Modifier.padding(top = 24.dp))
            Text("Seus estudos, organizados.", style = MaterialTheme.typography.headlineLarge, color = colors.onBackground, modifier = Modifier.padding(top = 2.dp))
            Text(
                "$line Planeje seus estudos, cronometre as sessões, revise no tempo certo e veja o progresso aparecer, $tagline",
                style = MaterialTheme.typography.bodyLarge,
                color = colors.onSurfaceVariant,
                modifier = Modifier.padding(top = 10.dp),
            )
            Spacer(Modifier.height(26.dp))

            when {
                configError != null -> Column(
                    Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(colors.surface).border(1.dp, colors.outline, RoundedCornerShape(18.dp)).padding(16.dp),
                ) {
                    Text("O servidor não respondeu.", style = MaterialTheme.typography.titleSmall, color = colors.onSurface)
                    Text(configError, style = MaterialTheme.typography.bodyMedium, color = colors.onSurfaceVariant, modifier = Modifier.padding(top = 4.dp))
                    OutlinedButton(onClick = onRetry, modifier = Modifier.padding(top = 10.dp)) { Text("Tentar de novo") }
                }
                config == null -> Box(Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) { CircularProgressIndicator(color = colors.primary) }
                else -> Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    if (config.google && !config.googleClientId.isNullOrBlank()) {
                        GoogleButton(dark = dark, busy = busy, onClick = onGoogle)
                    } else {
                        Text(
                            "A entrada com Google está em preparação. Use o código do site.",
                            style = MaterialTheme.typography.bodyMedium,
                            color = colors.onSurfaceVariant,
                            modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(colors.surface).border(1.dp, colors.outline, RoundedCornerShape(14.dp)).padding(14.dp),
                        )
                    }
                    if (showCode) {
                        Column(
                            Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(colors.surface).border(1.dp, colors.outline, RoundedCornerShape(18.dp)).padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            Text("Entrar com o código do site", style = MaterialTheme.typography.titleSmall, color = colors.onSurface)
                            Text("No site, já com a sua conta, abra Configurações → Relógio e gere um código. Ele vale por 10 minutos.", style = MaterialTheme.typography.bodySmall, color = colors.onSurfaceVariant)
                            OutlinedTextField(
                                value = code,
                                onValueChange = { v -> code = v.filter { it.isDigit() }.take(6) },
                                label = { Text("Código de 6 dígitos") },
                                singleLine = true,
                                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                                textStyle = MaterialTheme.typography.headlineSmall.copy(letterSpacing = 6.sp),
                                modifier = Modifier.fillMaxWidth(),
                            )
                            Button(
                                onClick = { onCode(code) },
                                enabled = code.length == 6 && !busy,
                                shape = RoundedCornerShape(14.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Cores.Brand600, contentColor = Cores.Brand50),
                                modifier = Modifier.fillMaxWidth().height(48.dp),
                            ) { Text("Entrar", style = MaterialTheme.typography.labelLarge) }
                        }
                    } else {
                        OutlinedButton(
                            onClick = { showCode = true },
                            enabled = !busy,
                            shape = RoundedCornerShape(16.dp),
                            border = BorderStroke(1.dp, colors.outline),
                            modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp),
                        ) { Text("Entrar com código do site", style = MaterialTheme.typography.labelLarge, color = colors.onBackground) }
                    }
                    if (config.devLogin) {
                        OutlinedTextField(value = name, onValueChange = { name = it }, label = { Text("Nome do visitante") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                        OutlinedButton(
                            onClick = { onDev(name.ifBlank { "Visitante" }) },
                            enabled = !busy,
                            shape = CircleShape,
                            modifier = Modifier.fillMaxWidth(),
                        ) {
                            Text("Entrar como visitante", color = colors.onSurfaceVariant)
                            Spacer(Modifier.width(8.dp))
                            Text("DEV", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = colors.onSurfaceVariant, modifier = Modifier.clip(RoundedCornerShape(4.dp)).background(colors.surfaceVariant).padding(horizontal = 6.dp, vertical = 2.dp))
                        }
                    }
                }
            }
            if (error != null) {
                Text(
                    error,
                    style = MaterialTheme.typography.bodyMedium,
                    color = colors.onSurface,
                    modifier = Modifier.padding(top = 14.dp).fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(colors.tertiary.copy(alpha = 0.12f)).border(1.dp, colors.tertiary.copy(alpha = 0.4f), RoundedCornerShape(14.dp)).padding(horizontal = 14.dp, vertical = 12.dp),
                )
            }

            Text(
                "Seus planos, arquivos e anotações ficam privados. Você escolhe se quer compartilhar totais de estudo nos rankings e grupos.",
                style = MaterialTheme.typography.bodySmall,
                color = colors.onSurfaceVariant,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth().padding(top = 26.dp),
            )

            Spacer(Modifier.height(12.dp))
            if (showServer) {
                OutlinedTextField(value = serverDraft, onValueChange = { serverDraft = it }, label = { Text("Servidor") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                TextButton(onClick = { onServer(serverDraft.trim()); showServer = false }, modifier = Modifier.align(Alignment.CenterHorizontally)) { Text("Usar este servidor") }
            } else {
                TextButton(onClick = { showServer = true }, modifier = Modifier.align(Alignment.CenterHorizontally)) {
                    Text(if (devBuild) server else "Outro servidor", style = MaterialTheme.typography.bodySmall, color = colors.onSurfaceVariant)
                }
            }
        }
    }
}

/** O botão de entrada do site: a cor escura da marca e o G do Google num círculo branco */
@Composable
private fun GoogleButton(dark: Boolean, busy: Boolean, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        enabled = !busy,
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = if (dark) Cores.Brand300 else Cores.Brand700,
            contentColor = if (dark) Cores.Brand900 else Cores.Brand50,
            disabledContainerColor = (if (dark) Cores.Brand300 else Cores.Brand700).copy(alpha = 0.7f),
            disabledContentColor = if (dark) Cores.Brand900 else Cores.Brand50,
        ),
        border = BorderStroke(1.dp, if (dark) Cores.Brand200.copy(alpha = 0.2f) else Cores.Brand800.copy(alpha = 0.3f)),
        modifier = Modifier.fillMaxWidth().heightIn(min = 56.dp),
    ) {
        Box(Modifier.size(32.dp).clip(CircleShape).background(Color.White), contentAlignment = Alignment.Center) {
            if (busy) CircularProgressIndicator(Modifier.size(18.dp), color = Cores.Brand700, strokeWidth = 2.dp)
            else Icon(painterResource(R.drawable.ic_google), contentDescription = null, tint = Color.Unspecified, modifier = Modifier.size(20.dp))
        }
        Spacer(Modifier.width(12.dp))
        Text("Continuar com o Google", fontSize = 15.sp, fontWeight = FontWeight.Bold)
    }
}
