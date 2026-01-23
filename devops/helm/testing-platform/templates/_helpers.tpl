{{/*
Expand the name of the chart.
*/}}
{{- define "testing-platform.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "testing-platform.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "testing-platform.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "testing-platform.labels" -}}
helm.sh/chart: {{ include "testing-platform.chart" . }}
{{ include "testing-platform.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "testing-platform.selectorLabels" -}}
app.kubernetes.io/name: {{ include "testing-platform.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "testing-platform.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "testing-platform.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Backend image
*/}}
{{- define "testing-platform.backend.image" -}}
{{- $registry := .Values.global.registry }}
{{- $repository := .Values.backend.image.repository }}
{{- $tag := .Values.backend.image.tag | default .Values.global.imageTag }}
{{- printf "%s/%s:%s" $registry $repository $tag }}
{{- end }}

{{/*
Frontend image
*/}}
{{- define "testing-platform.frontend.image" -}}
{{- $registry := .Values.global.registry }}
{{- $repository := .Values.frontend.image.repository }}
{{- $tag := .Values.frontend.image.tag | default .Values.global.imageTag }}
{{- printf "%s/%s:%s" $registry $repository $tag }}
{{- end }}

{{/*
Runner image
*/}}
{{- define "testing-platform.runner.image" -}}
{{- $registry := .Values.global.registry }}
{{- $repository := .Values.runner.image.repository }}
{{- $tag := .Values.runner.image.tag | default .Values.global.imageTag }}
{{- printf "%s/%s:%s" $registry $repository $tag }}
{{- end }}
