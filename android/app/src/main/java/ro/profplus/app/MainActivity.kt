package ro.profplus.app

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.fragment.app.FragmentActivity
import ro.profplus.app.ui.ProfPlusApp
import ro.profplus.app.ui.ProfPlusTheme

// BiometricPrompt cere FragmentActivity, nu doar ComponentActivity.
class MainActivity : FragmentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            ProfPlusTheme {
                ProfPlusApp(activity = this)
            }
        }
    }
}
