package ro.profplus.app.ui

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import ro.profplus.app.BuildConfig

@Composable
fun SettingsScreen(
    lockEnabled: Boolean,
    deviceCanLock: Boolean,
    onLockChanged: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(modifier.padding(24.dp), verticalArrangement = Arrangement.spacedBy(20.dp)) {
        Text("Setări", style = MaterialTheme.typography.headlineMedium)

        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Column(Modifier.weight(1f)) {
                Text("Blocare cu amprentă / PIN", style = MaterialTheme.typography.titleMedium)
                Text(
                    if (deviceCanLock) "Cere autentificarea la fiecare deschidere a aplicației."
                    else "Configurează o amprentă sau un PIN în setările telefonului.",
                    style = MaterialTheme.typography.bodySmall,
                )
            }
            Switch(checked = lockEnabled && deviceCanLock, onCheckedChange = onLockChanged, enabled = deviceCanLock)
        }

        AmbientLight()

        Text("Platformă: ${BuildConfig.WEB_URL}", style = MaterialTheme.typography.bodySmall)
        Text("Versiune aplicație: ${BuildConfig.VERSION_NAME}", style = MaterialTheme.typography.bodySmall)
    }
}

/** Afișează lumina ambientală; baza pentru comutarea automată a temei (planificat). */
@Composable
private fun AmbientLight() {
    val context = LocalContext.current
    var lux by remember { mutableStateOf<Float?>(null) }
    val sensorManager = remember { context.getSystemService(Context.SENSOR_SERVICE) as SensorManager }
    val sensor = remember { sensorManager.getDefaultSensor(Sensor.TYPE_LIGHT) }

    DisposableEffect(sensor) {
        val listener = object : SensorEventListener {
            override fun onSensorChanged(event: SensorEvent) { lux = event.values[0] }
            override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
        }
        sensor?.let { sensorManager.registerListener(listener, it, SensorManager.SENSOR_DELAY_NORMAL) }
        onDispose { sensorManager.unregisterListener(listener) }
    }

    val reading = lux
    Column {
        Text("Senzor de lumină", style = MaterialTheme.typography.titleMedium)
        Text(
            when {
                sensor == null -> "Indisponibil pe acest dispozitiv."
                reading == null -> "Se citește..."
                else -> "${reading.toInt()} lux"
            },
            style = MaterialTheme.typography.bodySmall,
        )
    }
}
