'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Paper, Title, TextInput, PasswordInput, Button, Text } from '@mantine/core';
import styles from './page.module.css';

export default function LoginProprietario() {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    console.log({ login, senha });
    // aqui depois você chama sua API de autenticação
  }

  return (
    <main className={styles.container}>
      <Paper className={styles.card} shadow="md" p="xl" radius="md">
        <Title order={2} className={styles.title}>
          Entrar como Proprietário
        </Title>

        <form onSubmit={handleSubmit}>
          <TextInput
            label="Login"
            placeholder="Seu login"
            value={login}
            onChange={(e) => setLogin(e.currentTarget.value)}
            required
          />
          <PasswordInput
            label="Senha"
            placeholder="Sua senha"
            mt="md"
            value={senha}
            onChange={(e) => setSenha(e.currentTarget.value)}
            required
          />
          <Button type="submit" fullWidth mt="xl" color="massaVermelho">
            Entrar
          </Button>
        </form>

        <Text size="sm" mt="md" ta="center">
          <Link href="/">Voltar ao início</Link>
        </Text>
      </Paper>
    </main>
  );
}