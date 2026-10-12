package br.app.coado.phone.web

import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface

/**
 * `window.CoadoNative`, o que o site enxerga quando roda no app (apps/web/src/lib/native.ts).
 * O JavaScript chama numa thread própria; tudo volta para a principal.
 */
class NativeBridge(
    private val onOpenTimer: (String) -> Unit,
    private val onAuthChanged: (String) -> Unit,
    private val onSignIn: () -> Unit,
) {
    private val main = Handler(Looper.getMainLooper())

    @JavascriptInterface
    fun openTimer(request: String) {
        main.post { onOpenTimer(request) }
    }

    @JavascriptInterface
    fun authChanged(status: String) {
        main.post { onAuthChanged(status) }
    }

    @JavascriptInterface
    fun signIn() {
        main.post { onSignIn() }
    }

    companion object {
        const val NAME = "CoadoNative"
    }
}
