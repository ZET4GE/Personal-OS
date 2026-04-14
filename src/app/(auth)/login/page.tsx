import { redirect } from 'next/navigation'

// /login now opens the landing page with the auth modal pre-opened
export default function LoginPage() {
  redirect('/?modal=login')
}
