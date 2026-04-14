import { redirect } from 'next/navigation'

// /signup now opens the landing page with the auth modal pre-opened
export default function SignupPage() {
  redirect('/?modal=signup')
}
