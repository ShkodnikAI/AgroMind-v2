/**
 * Index — защищённый роутинг
 */

import React from 'react';
import { AuthRouter } from '@/template';
import { Redirect } from 'expo-router';

export default function Index() {
  return (
    <AuthRouter loginRoute="/login">
      <Redirect href="/(tabs)" />
    </AuthRouter>
  );
}
