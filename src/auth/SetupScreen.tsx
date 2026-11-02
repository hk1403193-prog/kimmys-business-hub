import { AuthLayout } from './AuthLayout'

const problemCopy: Record<string, string> = {
  missing:
    'This practice site was built without its public Supabase address or publishable key. Those two build values have to be added, and the site has to be built again. The command center stays closed until then.',
  'invalid-url':
    'The practice project address or publishable key could not be used. Use the address ending in .supabase.co and the publishable key.',
  'live-site':
    'This app will not connect to the live customer website. Use the practice Supabase project address.',
  'secret-key':
    'A secret or service-role key was refused. Use only the publishable key.',
}

export function SetupScreen({ problem }: { problem: string }) {
  return (
    <AuthLayout title="Connect the practice project" eyebrow="Owner sign-in">
      <p>{problemCopy[problem] ?? problemCopy['invalid-url']}</p>
      <p>
        In the Supabase dashboard for kimmys-hub-practice, open Project Settings
        and API Keys. The project address and the publishable key are the two
        public build values. They do not belong in GitHub or in chat.
      </p>
      <p>The build value names are:</p>
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
