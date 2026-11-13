import { profileMetadata } from './about/metadata'
import Profile from './about/Profile'

export const metadata = profileMetadata

export default function Home() {
  return <Profile />
}
