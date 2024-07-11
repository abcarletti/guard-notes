import { PrismaClient, Provider } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { exec } from 'child_process'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function applyMigrations() {
	const env = process.env.NODE_ENV || 'development'
	if (env === 'development') {
		console.log('Skipping migrations in development environment')
		return
	}
	return new Promise<void>((resolve, reject) => {
		exec('npx prisma migrate deploy', (error, stdout, stderr) => {
			if (error) {
				console.error(`Error applying migrations: ${stderr}`)
				reject(error)
			}
			console.log(`Migrations applied: ${stdout}`)
			resolve()
		})
	})
}

async function createDefaultUser() {
	const defaultUsername = process.env.DEFAULT_USERNAME
	console.log('defaultUsername', defaultUsername)

	if (!defaultUsername) {
		console.log('No default username provided')
		return
	}

	const user = await prisma.user.findFirst({
		where: { username: defaultUsername },
	})

	console.log('user', user)

	if (user) {
		console.log('Default user already exists')
		return
	}

	const defaultPassword = process.env.DEFAULT_PASSWORD || ''

	if (!defaultPassword) {
		console.log('No default password provided')
		return
	}

	await prisma.user.create({
		data: {
			provider: Provider.CREDENTIALS,
			username: defaultUsername,
			password: await bcrypt.hash(defaultPassword, 10),
			completeName: defaultUsername,
		},
	})
}

async function main() {
	await applyMigrations()
	await createDefaultUser()
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})