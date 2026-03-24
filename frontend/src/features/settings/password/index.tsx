import { ContentSection } from '../components/content-section'
import { PasswordForm } from './password-form'

export function SettingsAccount() {
  return (
    <ContentSection
      title='密码重置'
      desc='更新你的密码'
    >
      <PasswordForm />
    </ContentSection>
  )
}
