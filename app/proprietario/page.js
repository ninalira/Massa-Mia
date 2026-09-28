'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Paper, Title, TextInput, PasswordInput, Button, Text } from '@mantine/core';
import styles from './page.module.css';

const DEMO_LOGIN = 'proprietario';
const DEMO_PASSWORD = 'massa123';

export default function LoginProprietario() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  function handleSubmit(e) {
    e.preventDefault();

    if (login.trim() !== DEMO_LOGIN || senha !== DEMO_PASSWORD) {
      setErro('Login ou senha inválidos. Confira os dados de demonstração.');
      return;
    }

    setErro('');
    router.push('/proprietario/menu');
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
            autoComplete="username"
            onChange={(e) => {
              setLogin(e.currentTarget.value);
              setErro('');
            }}
            required
          />
          <PasswordInput
            label="Senha"
            placeholder="Sua senha"
            mt="md"
            value={senha}
            autoComplete="current-password"
            onChange={(e) => {
              setSenha(e.currentTarget.value);
              setErro('');
            }}
            required
          />
          <Button type="submit" fullWidth mt="xl" color="massaVermelho">
            Entrar
          </Button>
        </form>

        {erro && <Text className={styles.error} role="alert" size="sm">{erro}</Text>}

        <Text className={styles.demoInfo} size="sm" ta="center">
          Acesso de demonstração: <strong>proprietario</strong> / <strong>massa123</strong>
        </Text>

        <Text size="sm" mt="md" ta="center">
          <Link href="/">Voltar ao início</Link>
        </Text>
      </Paper>
    </main>
  );
}