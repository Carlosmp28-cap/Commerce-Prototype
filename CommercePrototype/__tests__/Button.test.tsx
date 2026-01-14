import React from 'react'
import { render } from '@testing-library/react-native'
import ButtonBase from '../app/components/Button'

test('Button renders title', () => {
  const { getByText } = render(<ButtonBase title="Click me" />)
  expect(getByText('Click me')).toBeTruthy()
})
