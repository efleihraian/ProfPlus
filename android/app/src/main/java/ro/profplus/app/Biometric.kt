package ro.profplus.app

import androidx.biometric.BiometricManager
import androidx.biometric.BiometricManager.Authenticators.BIOMETRIC_WEAK
import androidx.biometric.BiometricManager.Authenticators.DEVICE_CREDENTIAL
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity

private const val AUTHENTICATORS = BIOMETRIC_WEAK or DEVICE_CREDENTIAL

fun canAuthenticate(activity: FragmentActivity): Boolean =
    BiometricManager.from(activity).canAuthenticate(AUTHENTICATORS) == BiometricManager.BIOMETRIC_SUCCESS

fun authenticate(activity: FragmentActivity, onSuccess: () -> Unit, onFailure: (String) -> Unit) {
    val prompt = BiometricPrompt(
        activity,
        ContextCompat.getMainExecutor(activity),
        object : BiometricPrompt.AuthenticationCallback() {
            override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) = onSuccess()
            override fun onAuthenticationError(errorCode: Int, errString: CharSequence) = onFailure(errString.toString())
        },
    )
    val info = BiometricPrompt.PromptInfo.Builder()
        .setTitle("Deblochează ProfPlus")
        .setSubtitle("Documentele tale sunt protejate")
        .setAllowedAuthenticators(AUTHENTICATORS)
        .build()
    prompt.authenticate(info)
}
