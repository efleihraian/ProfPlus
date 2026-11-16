package ro.profplus.app.ui

import android.content.ActivityNotFoundException
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.speech.RecognizerIntent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import java.util.Locale

/**
 * Dictare cu microfonul: profesorul vorbește, textul apare aici și poate fi copiat
 * în conversația cu asistentul. Sunetul este procesat de serviciul de recunoaștere al telefonului.
 */
@Composable
fun DictationScreen(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    var text by remember { mutableStateOf("") }
    var message by remember { mutableStateOf<String?>(null) }

    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        val spoken = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)?.firstOrNull()
        if (spoken != null) text = if (text.isBlank()) spoken else "$text $spoken"
    }

    Column(modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        Text("Dictare", style = MaterialTheme.typography.headlineMedium)
        Text("Apasă butonul și spune întrebarea sau cerința pentru asistent.", style = MaterialTheme.typography.bodyMedium)

        Button(onClick = {
            val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale("ro", "RO").toLanguageTag())
                putExtra(RecognizerIntent.EXTRA_PROMPT, "Vorbește acum")
            }
            try {
                message = null
                launcher.launch(intent)
            } catch (e: ActivityNotFoundException) {
                message = "Telefonul nu are un serviciu de recunoaștere vocală."
            }
        }) { Text("Începe dictarea") }

        OutlinedTextField(
            value = text,
            onValueChange = { text = it },
            label = { Text("Text dictat") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 4,
        )

        OutlinedButton(
            enabled = text.isNotBlank(),
            onClick = {
                val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as ClipboardManager
                clipboard.setPrimaryClip(ClipData.newPlainText("dictare", text))
                message = "Text copiat. Lipește-l în conversația cu asistentul."
            },
        ) { Text("Copiază textul") }

        message?.let { Text(it, style = MaterialTheme.typography.bodySmall) }
    }
}
