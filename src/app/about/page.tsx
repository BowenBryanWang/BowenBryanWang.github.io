import { profileMetadata } from './metadata'
import Profile from './Profile'

export const metadata = {
  ...profileMetadata,
  title: 'About',
}

export default function About() {
  return <Profile />
}
