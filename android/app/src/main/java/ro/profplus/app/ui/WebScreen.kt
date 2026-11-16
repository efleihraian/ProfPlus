package ro.profplus.app.ui

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.view.ViewGroup
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.viewinterop.AndroidView
import ro.profplus.app.BuildConfig

/** Un singur WebView păstrat între taburi, ca sesiunea să nu se piardă. */
@SuppressLint("SetJavaScriptEnabled")
@Composable
fun rememberProfPlusWebView(onCanGoBackChanged: (Boolean) -> Unit): WebView {
    val context = LocalContext.current
    val chooser = remember { arrayOfNulls<ValueCallback<Array<Uri>>>(1) }

    val chooserLauncher = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        chooser[0]?.onReceiveValue(
            WebChromeClient.FileChooserParams.parseResult(result.resultCode, result.data),
        )
        chooser[0] = null
    }

    return remember {
        WebView(context).apply {
            layoutParams = ViewGroup.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT)
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            webViewClient = object : WebViewClient() {
                override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                    // Linkurile către alte domenii se deschid în browser.
                    val own = Uri.parse(BuildConfig.WEB_URL).host.orEmpty()
                    if (request.url.host == own) return false
                    context.startActivity(Intent(Intent.ACTION_VIEW, request.url).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
                    return true
                }

                override fun doUpdateVisitedHistory(view: WebView, url: String?, isReload: Boolean) {
                    onCanGoBackChanged(view.canGoBack())
                }
            }
            // Permite încărcarea documentelor (PDF, DOCX etc.) din aplicație.
            webChromeClient = object : WebChromeClient() {
                override fun onShowFileChooser(
                    webView: WebView,
                    callback: ValueCallback<Array<Uri>>,
                    params: FileChooserParams,
                ): Boolean {
                    chooser[0]?.onReceiveValue(null)
                    chooser[0] = callback
                    chooserLauncher.launch(params.createIntent())
                    return true
                }
            }
            loadUrl(BuildConfig.WEB_URL)
        }
    }
}

@Composable
fun WebScreen(webView: WebView, modifier: Modifier = Modifier) {
    AndroidView(
        modifier = modifier,
        factory = {
            (webView.parent as? ViewGroup)?.removeView(webView)
            webView
        },
    )
}
