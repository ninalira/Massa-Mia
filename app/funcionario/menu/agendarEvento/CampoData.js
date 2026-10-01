'use client';

import { useRef, useState } from 'react';
import { Alert, TextInput } from '@mantine/core';
import { consultarFeriado } from './actions';

export default function CampoData({ className }) {
	const [feriado, setFeriado] = useState(null);
	const ultimaData = useRef('');

	async function aoMudar(e) {
		const valor = e.currentTarget.value;
		ultimaData.current = valor;
		setFeriado(null);
		if (!valor) return;

		const nome = await consultarFeriado(valor);
		// Ignora a resposta se a pessoa já escolheu outra data enquanto esperava.
		if (ultimaData.current === valor) setFeriado(nome);
	}

	return (
		<div className={className}>
			<TextInput label="Data do evento" name="data" required type="date" onChange={aoMudar} />
			{feriado && (
				<Alert color="massaAmarelo" mt="xs" py="xs" variant="light">
					Feriado de {feriado}.
				</Alert>
			)}
		</div>
	);
}