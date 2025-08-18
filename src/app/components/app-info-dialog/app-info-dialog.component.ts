import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';

export interface AppInfoData {
	name: string;
	version: string;
	dataSource: string;
	repository?: string;
	buildDate?: string;
}

@Component({
	selector: 'app-info-dialog',
	standalone: true,
	imports: [CommonModule, MatDialogModule, MatDividerModule, MatButtonModule],
	template: `
		<h2 mat-dialog-title>Información de la aplicación</h2>
		<mat-dialog-content>
			<div class="info-row">
				<span class="label">Nombre</span>
				<span class="value">{{ data.name }}</span>
			</div>
			<div class="info-row">
				<span class="label">Versión</span>
				<span class="value">{{ data.version }}</span>
			</div>
			<div class="info-row">
				<span class="label">Fuente de datos</span>
				<span class="value">{{ data.dataSource }}</span>
			</div>
			<div class="info-row" *ngIf="data.repository">
				<span class="label">Repositorio</span>
				<span class="value"><a class="link" href="{{ data.repository }}" target="_blank" rel="noopener">{{ data.repository }}</a></span>
			</div>
			<div class="info-row" *ngIf="data.buildDate">
				<span class="label">Fecha de compilación</span>
				<span class="value">{{ data.buildDate }}</span>
			</div>
			<mat-divider></mat-divider>
			<p class="notes">
				Esta aplicación permite consultar los feriados nacionales de la República Argentina. Funciona sin conexión mediante almacenamiento en caché y verifica nuevas versiones automáticamente.
			</p>
		</mat-dialog-content>
		<mat-dialog-actions align="end">
			<button mat-stroked-button (click)="onClose()">Cerrar</button>
		</mat-dialog-actions>
	`,
	styles: [`
		:host { display: block; min-width: 320px; }
		.info-row { display: grid; grid-template-columns: 160px 1fr; gap: 16px; margin: 8px 0; }
		.label { color: rgba(0,0,0,0.6); font-weight: 500; }
		.value { color: inherit; word-break: break-word; }
		.link { color: var(--app-primary); text-decoration: none; }
		.link:hover { text-decoration: underline; }
		.notes { margin-top: 16px; opacity: 0.8; }
	`]
})
export class AppInfoDialogComponent {
	constructor(
		private readonly dialogRef: MatDialogRef<AppInfoDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: AppInfoData
	) {}

	onClose(): void {
		this.dialogRef.close();
	}
}
