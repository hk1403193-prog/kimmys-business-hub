import { AuthLayout } from './AuthLayout'

const problemCopy: Record<string, string> = {
  missing:
    'Add the practice project URL and the publishable key in .env.local on this computer, then restart the preview.',
  'invalid-url':
    'The practice project URL or publishable key could not be used. Check both values in .env.local and restart the preview.',
  'live-site':
    'This preview will not connect to the live customer website. Use the practice Supabase project URL.',
  'secret-key':
    'A secret or service-role key was refused. Use only the publishable key in .env.local.',
}

export function SetupScreen({ problem }: { problem: string }) {
  return (
    <AuthLayout title="Connect the practice project" eyebrow="Owner sign-in">
      <p>{problemCopy[problem] ?? problemCopy['invalid-url']}</p>
      <p>
        In the Supabase dashboard for kimmys-hub-practice, open Project Settings
        and API Keys. Copy the project URL and the publishable key into a file
        named <strong>.env.local</strong> in this project folder. Do not put
        them in GitHub, and do not paste them into chat.
      </p>
      <p>The file should use these names:</p>
      <p className="secret-box">
        VITE_SUPABASE_URL
        <br />
        VITE_SUPABASE_PUBLISHABLE_KEY
      </p>
      <p>
        Leave the secret key in the dashboard. The command center stays closed
        until the public values are present.
      </p>
    </AuthLayout>
  )
}
