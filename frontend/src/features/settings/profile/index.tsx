import { ContentSection } from '../components/content-section'
import { ProfileForm } from './profile-form'


export function SettingsProfile() {
  return (
    <ContentSection
      title='个人资料'
      desc='这是其他人将在网站上看到你的地方。'
    >
      <ProfileForm />
    </ContentSection>
  )
}
