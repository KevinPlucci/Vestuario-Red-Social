import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsuariosModule } from '../usuarios/usuarios.module';
import { AutenticacionController } from './autenticacion.controller';
import { AutenticacionService } from './autenticacion.service';
import { DURACION_TOKEN_SEGUNDOS } from './token';

@Module({
  imports: [
    UsuariosModule,
    // Global: SesionGuard (que necesita JwtService) se usa también en Usuarios y Publicaciones.
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRETO'),
        signOptions: { expiresIn: DURACION_TOKEN_SEGUNDOS },
      }),
    }),
  ],
  controllers: [AutenticacionController],
  providers: [AutenticacionService],
  // SesionGuard también necesita UsuariosService en cada módulo que lo usa.
  exports: [UsuariosModule],
})
export class AutenticacionModule {}
