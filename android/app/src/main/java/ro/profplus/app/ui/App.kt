package ro.profplus.app.ui

import android.content.Context
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Face
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.Button
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.fragment.app.FragmentActivity
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.compose.LifecycleEventEffect
import ro.profplus.app.authenticate
import ro.profplus.app.canAuthenticate

private enum class Tab(val label: String) { Plusi("Asistent"), Scan("Scanează"), Settings("Setări") }

private const val PREFS = "profplus"
private const val KEY_LOCK = "biometric_lock"

@Composable
fun ProfPlusApp(activity: FragmentActivity) {
    val prefs = remember { activity.getSharedPreferences(PREFS, Context.MODE_PRIVATE) }
    var lockEnabled by remember { mutableStateOf(prefs.getBoolean(KEY_LOCK, true)) }
    var unlocked by rememberSaveable { mutableStateOf(false) }
    val deviceCanLock = remember { canAuthenticate(activity) }

    // Aplicația se reblochează când ajunge în fundal.
    LifecycleEventEffect(Lifecycle.Event.ON_STOP) { unlocked = false }

    if (lockEnabled && deviceCanLock && !unlocked) {
        LockScreen(activity) { unlocked = true }
        return
    }

    var tab by rememberSaveable { mutableStateOf(Tab.Plusi) }
    var webCanGoBack by remember { mutableStateOf(false) }
    val webView = rememberProfPlusWebView(onCanGoBackChanged = { webCanGoBack = it })

    BackHandler(enabled = tab == Tab.Plusi && webCanGoBack) { webView.goBack() }

    Scaffold(
        bottomBar = {
            NavigationBar {
                Tab.entries.forEach { t ->
                    NavigationBarItem(
                        selected = tab == t,
                        onClick = { tab = t },
                        icon = {
                            Icon(
                                when (t) {
                                    Tab.Plusi -> Icons.Default.Face
                                    Tab.Scan -> Icons.Default.Search
                                    Tab.Settings -> Icons.Default.Settings
                                },
                                contentDescription = null,
                            )
                        },
                        label = { Text(t.label) },
                    )
                }
            }
        },
    ) { padding ->
        val modifier = Modifier.padding(padding).fillMaxSize()
        when (tab) {
            Tab.Plusi -> WebScreen(webView, modifier)
            Tab.Scan -> ScanScreen(modifier)
            Tab.Settings -> SettingsScreen(
                lockEnabled = lockEnabled,
                deviceCanLock = deviceCanLock,
                onLockChanged = {
                    lockEnabled = it
                    prefs.edit().putBoolean(KEY_LOCK, it).apply()
                },
                modifier = modifier,
            )
        }
    }
}

@Composable
private fun LockScreen(activity: FragmentActivity, onUnlocked: () -> Unit) {
    var error by remember { mutableStateOf<String?>(null) }
    val prompt = { authenticate(activity, onSuccess = onUnlocked, onFailure = { error = it }) }
    LaunchedEffect(Unit) { prompt() }

    Surface(Modifier.fillMaxSize()) {
        Column(
            Modifier.fillMaxSize().padding(32.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text("ProfPlus", style = MaterialTheme.typography.headlineLarge)
            Text("Aplicația este blocată", Modifier.padding(top = 8.dp, bottom = 24.dp))
            Button(onClick = { prompt() }) { Text("Deblochează") }
            error?.let { Text(it, Modifier.padding(top = 16.dp), color = MaterialTheme.colorScheme.error) }
        }
    }
}
