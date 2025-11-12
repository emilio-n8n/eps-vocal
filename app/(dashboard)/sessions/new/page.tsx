import { Suspense } from 'react'
import NewSessionForm from './form'

export default function NewSessionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewSessionForm />
    </Suspense>
  )
}
