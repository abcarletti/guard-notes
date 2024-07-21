'use client'

import { useToast } from '@/app/hooks/use-toast'
import { createOrUpdateCredentials } from '@/app/services/kv-service'
import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { CREDENTIALS_KEY } from '@/lib/constants'
import { queryClient } from '@/providers/tanstack-query'
import { createKVSchema } from '@/schemas/kv'
import { zodResolver } from '@hookform/resolvers/zod'
import { Kv } from '@prisma/client'
import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const KVForm = ({
	kvDetail,
	groupId,
	closeDialog,
}: {
	kvDetail?: Kv
	groupId: string
	closeDialog: () => void
}) => {
	const { setMessage } = useToast()
	const [showPassword, setShowPassword] = useState(false)

	const form = useForm<z.infer<typeof createKVSchema>>({
		resolver: zodResolver(createKVSchema),
		defaultValues: {
			key: kvDetail?.key || '',
			value: kvDetail?.value || '',
			environment: kvDetail?.environment || '',
		},
	})
	const { reset } = form

	const onSubmit = async (values: z.infer<typeof createKVSchema>) => {
		try {
			await createOrUpdateCredentials(kvDetail?.id, groupId, values)
			await queryClient.invalidateQueries({
				queryKey: [
					CREDENTIALS_KEY,
					{
						group: groupId,
					},
				],
			})
			reset()
			setMessage({
				message: kvDetail
					? 'Credenciales actualizadas'
					: 'Credenciales creadas',
				type: 'success',
			})
			closeDialog()
		} catch (error) {
			setMessage({
				message: 'Se ha producido un error guardando las credenciales',
				type: 'error',
			})
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="mt-4">
				<div className="flex flex-col gap-2">
					<FormField
						control={form.control}
						name="environment"
						render={({ field }) => (
							<FormItem className="w-full">
								<Select
									onValueChange={field.onChange}
									defaultValue={field.value}
								>
									<FormControl>
										<SelectTrigger>
											<div className="flex gap-2 items-center">
												<Label className="text-xs text-gray-500">
													Entorno:
												</Label>
												<SelectValue placeholder="Selecciona un entorno" />
											</div>
										</SelectTrigger>
									</FormControl>
									<SelectContent>
										<SelectItem value="LOCAL">Local</SelectItem>
										<SelectItem value="DEV">Desarrollo</SelectItem>
										<SelectItem value="PRE">Pre-producción</SelectItem>
										<SelectItem value="PRO">Producción</SelectItem>
									</SelectContent>
								</Select>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className="flex gap-2">
						<FormField
							control={form.control}
							name="key"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel>Usuario</FormLabel>
									<FormControl>
										<Input placeholder="Usuario" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="value"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel>Contraseña</FormLabel>
									<FormControl>
										<div className="flex items-center">
											<Input
												className="relative"
												type={showPassword ? 'text' : 'password'}
												placeholder="Constraseña"
												{...field}
											/>
											<Button
												variant={'ghost'}
												size={'icon'}
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-6"
											>
												{showPassword ? (
													<EyeOff className="size-5" />
												) : (
													<Eye className="size-5" />
												)}
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				</div>
				<footer className="flex flex-row-reverse mt-4 gap-2">
					<Button type="submit" size={'lg'} className="w-full">
						{kvDetail ? 'Actualizar' : 'Guardar'}
					</Button>
					<Button
						size={'lg'}
						variant={'secondary'}
						className="w-full"
						onClick={closeDialog}
					>
						Cancelar
					</Button>
				</footer>
			</form>
		</Form>
	)
}

export default KVForm