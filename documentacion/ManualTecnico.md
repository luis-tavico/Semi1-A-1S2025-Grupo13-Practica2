# Manual Técnico - TaskFlow + CloudDrive

## Índice
1. [Integrantes](#integrantes)
2. [Descripción de la Arquitectura](#descripción-de-la-arquitectura)
3. [Usuarios IAM y Políticas (AWS)](#usuarios-iam-y-políticas-aws)
4. [Recursos AWS](#recursos-aws)
5. [Recursos Azure](#recursos-azure)
6. [Comparativa entre AWS y Azure](#comparativa-entre-aws-y-azure)
7. [Tecnologías Utilizadas](#tecnologías-utilizadas)
8. [Estructura del Proyecto](#estructura-del-proyecto)
9. [Guía de Despliegue](#guía-de-despliegue)
10. [API y Endpoints](#api-y-endpoints)

## Integrantes

| Nombre Completo | Carnet |
|-----------------|--------|
| [Kevin Estuardo Secaida Molina](https://github.com/KESM12) | 201602404 |
| [Oscar Eduardo Morales Girón](https://github.com/Racs0XD) | 201603028 |
| [Moises Antonio Conde Hernandez](https://github.com/moises23c99) | 202000127 |
| [Pedro Luis Pu Tavico](https://github.com/luis-tavico) | 202000562 |
| [Edwin Sandoval López](https://github.com/Evtray) | 202010856 |

## Descripción de la Arquitectura

TaskFlow + CloudDrive implementa una arquitectura cloud-native distribuida en dos proveedores principales: AWS y Azure. A continuación, se detalla cada componente de la arquitectura:

### Arquitectura en AWS

![img](/imagenes/imagen1.png)

La arquitectura en AWS se compone de:

1. **Frontend**: Aplicación web estática alojada en Amazon S3
2. **Backend**: 
   - Dos servidores desplegados en instancias EC2 (Node.js y Python)
   - Balanceador de carga Application Load Balancer (ALB)
3. **Base de Datos**: Amazon RDS (MySQL/PostgreSQL)
4. **Almacenamiento de Archivos**: Bucket S3 público
5. **Funciones Serverless**: AWS Lambda con API Gateway para gestión de archivos

El flujo de funcionamiento es el siguiente:
- El usuario accede a la aplicación web alojada en S3
- Las peticiones al backend son dirigidas al Load Balancer
- El Load Balancer distribuye el tráfico entre los servidores Node.js y Python
- Los servidores procesan las solicitudes y se comunican con RDS para operaciones de base de datos
- Las operaciones de carga y descarga de archivos se gestionan a través de funciones Lambda y API Gateway

### Arquitectura en Azure

![img](/imagenes/imagen2.png)

La arquitectura en Azure se compone de:

1. **Frontend**: Aplicación web estática alojada en Azure Blob Storage
2. **Backend**: 
   - Dos servidores desplegados en Azure Virtual Machines (Node.js y Python)
   - Azure Load Balancer
3. **Base de Datos**: Base de datos gestionada (equivalente a RDS)
4. **Almacenamiento de Archivos**: Azure Blob Storage Container
5. **Funciones Serverless**: Azure Functions con API Management para gestión de archivos

## Usuarios IAM y Políticas (AWS)

### Usuario: EC2-TaskFlow

Este usuario es utilizado para las instancias EC2 que ejecutan los servidores backend.

**Políticas asociadas**:
- `AmazonS3ReadOnlyAccess`: Permite leer objetos del bucket S3
- `AmazonRDSDataFullAccess`: Permite acceso completo a la base de datos RDS

**JSON de la política personalizada**:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::practica2semi1a1s2025Archivosg#",
                "arn:aws:s3:::practica2semi1a1s2025Archivosg#/*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "rds:*"
            ],
            "Resource": "arn:aws:rds:region:account-id:db:taskflow-db"
        }
    ]
}
```

### Usuario: Lambda-FileManager

Este usuario es utilizado por las funciones Lambda para gestionar archivos.

**Políticas asociadas**:
- `AmazonS3FullAccess`: Permite lectura/escritura en el bucket S3

**JSON de la política personalizada**:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::practica2semi1a1s2025Archivosg#",
                "arn:aws:s3:::practica2semi1a1s2025Archivosg#/*"
            ]
        }
    ]
}
```

## Recursos AWS

### Buckets de Amazon S3

#### Bucket para Frontend
- **Nombre**: practica2semi1a1s2025paginawebg13
- **Configuración**: Alojamiento de sitio web estático habilitado
- **Políticas**: Acceso público de lectura habilitado

![img](/imagenes/imagen3.png)

#### Bucket para Archivos
- **Nombre**: practica2semi1a1s2025Archivosg13
- **Configuración**: Acceso público de lectura habilitado, CORS configurado para permitir solicitudes desde el frontend
- **Políticas**: Configuradas para permitir acceso público a los archivos

![img](/imagenes/imagen4.png)


### Instancias EC2

#### Instancia Node.js
- **AMI**: Amazon Linux 2
- **Tipo**: t2.micro
- **Grupo de seguridad**: 
  - Puerto 3000 abierto para el Load Balancer
  - Puerto 22 (SSH) restringido a IPs específicas

![img](/imagenes/imagen.png)

#### Instancia Python
- **AMI**: Amazon Linux 2
- **Tipo**: t2.micro
- **Grupo de seguridad**: 
  - Puerto 5000 abierto para el Load Balancer
  - Puerto 22 (SSH) restringido a IPs específicas

![img](/imagenes/imagen.png)

### Balanceador de Carga

- **Tipo**: Application Load Balancer
- **Listeners**: HTTP en puerto 80
- **Target Groups**:
  - TG-NodeJS: Apunta a la instancia Node.js en puerto 3000
  - TG-Python: Apunta a la instancia Python en puerto 5000
- **Algoritmo**: Round Robin

![img](/imagenes/imagen.png)

### Base de Datos RDS

- **Motor**: MySQL/PostgreSQL
- **Clase**: db.t2.micro
- **Almacenamiento**: 20GB SSD
- **Multi-AZ**: No (entorno de desarrollo)
- **Acceso público**: No (solo accesible desde instancias EC2)

![img](/imagenes/imagen7.png)

### Funciones Lambda

#### Lambda para Carga de Imágenes
- **Runtime**: Node.js 14.x
- **Memoria**: 256MB
- **Timeout**: 10 segundos
- **Trigger**: API Gateway
- **Políticas**: Acceso a S3 para escritura

#### Lambda para Carga de Documentos
- **Runtime**: Python 3.8
- **Memoria**: 256MB
- **Timeout**: 10 segundos
- **Trigger**: API Gateway
- **Políticas**: Acceso a S3 para escritura

![img](/imagenes/imagen5.png)


### Configuración de API Gateway

- **Nombre**: TaskFlow-FileAPI
- **Tipo**: REST API
- **Etapas**: dev, prod
- **Recursos**: 
  - POST /upload/image: Integrado con Lambda para imágenes
  - POST /upload/document: Integrado con Lambda para documentos
- **CORS**: Habilitado para permitir solicitudes desde el frontend

![img](/imagenes/imagen6.png)

## Recursos Azure

### Blob Containers

#### Container para Frontend
- **Nombre**: practica2semi1a1s2025paginawebg13
- **Nivel de acceso**: Blob (lectura anónima para blobs individuales)
- **Configuración**: Habilitado para alojamiento de sitio web estático

![Azure Blob Frontend](https://ruta-a-captura-blob-frontend.png)

#### Container para Archivos
- **Nombre**: practica2semi1a1s2025Archivosg13
- **Nivel de acceso**: Blob (lectura anónima para blobs individuales)
- **Configuración**: CORS habilitado para permitir solicitudes desde el frontend

![Azure Blob Archivos](https://ruta-a-captura-blob-archivos.png)

### Instancias VM de Azure

#### VM Node.js
- **Imagen**: Ubuntu Server 20.04 LTS
- **Tamaño**: B1s (1 vCPU, 1 GB RAM)
- **Grupo de seguridad de red**: 
  - Puerto 3000 abierto para el Load Balancer
  - Puerto 22 (SSH) restringido a IPs específicas

![Azure VM Node.js](https://ruta-a-captura-vm-nodejs.png)

#### VM Python
- **Imagen**: Ubuntu Server 20.04 LTS
- **Tamaño**: B1s (1 vCPU, 1 GB RAM)
- **Grupo de seguridad de red**: 
  - Puerto 5000 abierto para el Load Balancer
  - Puerto 22 (SSH) restringido a IPs específicas

![Azure VM Python](https://ruta-a-captura-vm-python.png)

### Balanceador de Carga de Azure

- **SKU**: Básico
- **Frontend IP**: IP pública
- **Backend pools**: Contiene las dos VMs (Node.js y Python)
- **Reglas de balanceo**: 
  - HTTP:3000 para Node.js
  - HTTP:5000 para Python
- **Health probes**: Configuradas para cada servicio

![Azure Load Balancer](https://ruta-a-captura-azure-lb.png)

### Funciones de Azure Functions

#### Function para Carga de Imágenes
- **Runtime**: Node.js 14
- **Trigger**: HTTP
- **Autenticación**: Sin autenticación (gestionada por API Management)
- **Integración**: Azure Blob Storage

![Azure Function Imágenes](https://ruta-a-captura-function-imagenes.png)

#### Function para Carga de Documentos
- **Runtime**: Python 3.8
- **Trigger**: HTTP
- **Autenticación**: Sin autenticación (gestionada por API Management)
- **Integración**: Azure Blob Storage

![Azure Function Documentos](https://ruta-a-captura-function-documentos.png)

### Configuración de API Management

- **SKU**: Developer
- **APIs**: 
  - TaskFlow-FileAPI
    - POST /upload/image: Integrado con Azure Function para imágenes
    - POST /upload/document: Integrado con Azure Function para documentos
- **CORS**: Habilitado para el dominio del frontend
- **Políticas**: Rate limiting configurado

![API Management](https://ruta-a-captura-api-management.png)

## Comparativa entre AWS y Azure

### Diferencias percibidas

| Aspecto | AWS | Azure | Observaciones |
|---------|-----|-------|--------------|
| **Interfaz de usuario** | Más técnica y detallada | Más moderna e intuitiva | Azure ofrece una experiencia más visual, mientras que AWS presenta más información técnica de entrada |
| **Configuración de servicios** | Mayor granularidad en permisos y opciones | Opciones más simplificadas | AWS permite un control más fino pero requiere mayor conocimiento, Azure facilita la configuración rápida |
| **Integración entre servicios** | Integración mediante ARNs y servicios como IAM | Integración mediante Grupos de Recursos | Azure facilita la administración de recursos relacionados al agruparlos lógicamente |
| **Precios y facturación** | Modelo de precios más detallado y variable | Precios más predecibles | Azure tiende a ofrecer precios más simplificados y predecibles |
| **Despliegue** | Más opciones de personalización | Más automatización integrada | Azure ofrece mayor integración con CI/CD y herramientas de desarrollo |
| **Serverless** | Mayor madurez en Lambda, configuración más detallada | Integración más sencilla, menos opciones | AWS Lambda ofrece más opciones de configuración, Azure Functions es más sencillo de implementar |

### Conclusiones

1. **Curva de aprendizaje**: Azure presenta una curva de aprendizaje menos pronunciada gracias a su interfaz más intuitiva y opciones simplificadas.

2. **Configuración de servicios**: AWS requiere más conocimiento técnico pero ofrece un control más granular sobre los recursos y servicios.

3. **Integración entre servicios**: Azure facilita la integración entre servicios al utilizar el concepto de Grupos de Recursos, mientras que AWS requiere una configuración más explícita.

4. **Rendimiento**: Ambos servicios ofrecen rendimiento similar para las cargas de trabajo implementadas en este proyecto.

5. **Costos**: Para un proyecto pequeño como este, los costos son similares, aunque Azure podría resultar ligeramente más económico en algunos escenarios de uso.

6. **Recomendación**: La elección entre AWS y Azure dependerá principalmente del caso de uso específico y las necesidades del proyecto. Para equipos con menor experiencia en cloud, Azure podría ser más accesible inicialmente.

## Tecnologías Utilizadas

### Frontend
- **Framework**: React.js
- **Biblioteca UI**: Material-UI
- **Gestión de estados**: Redux
- **Routing**: React Router

### Backend
- **Servidor Node.js**:
  - Express.js
  - Multer (para manejo de archivos)
  - AWS SDK para Node.js
  - Azure SDK para Node.js
  
- **Servidor Python**:
  - Flask
  - Boto3 (AWS SDK para Python)
  - Azure SDK para Python

### Base de Datos
- MySQL/PostgreSQL
- Esquema relacional para usuarios y tareas

### Infraestructura
- Terraform para la gestión de infraestructura como código (opcional)
- GitHub Actions para CI/CD

## Estructura del Proyecto

```
TaskFlow-CloudDrive/
frontend/                  
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   |    ├── Archivos.js
│   │   |    ├── Login.js
│   │   |    ├── Registro.js
│   │   |    ├── RutaPrivada.js
│   │   |    ├── Tarea.js
│   │   |    ├── Tareas.js
│   │   └── App.js
│   └── package.json
backend_nodejs/
│── node_modules/
│── src/
│   │── config/
│   │   ├── database.js
│   │── controllers/
│   │   ├── fileController.js
│   │   ├── taskController.js
│   │   ├── userController.js
│   │── middleware/
│   │   ├── authMiddleware
│   │── models/
│   │   ├── fileModel.js
│   │   ├── taskModel.js
│   │   ├── userModel.js
│   │── routes/
│   │   ├── fileRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── userRoutes.js
│── .env
│── package.json
│── server.js
```

## Guía de Despliegue

### Requisitos Previos
- Cuenta de AWS con acceso a los servicios requeridos
- Cuenta de Azure con suscripción activa
- AWS CLI configurado
- Azure CLI configurado
- Node.js (v14+) y npm
- Python (v3.8+) y pip
- Git

### Despliegue en AWS

#### 1. Creación de la base de datos RDS
```bash
aws rds create-db-instance \
    --db-instance-identifier taskflow-db \
    --db-instance-class db.t2.micro \
    --engine mysql \
    --master-username admin \
    --master-user-password <contraseña> \
    --allocated-storage 20
```

#### 2. Creación de Buckets S3
```bash
# Bucket para la página web
aws s3 mb s3://practica2semi1a1s2025paginawebg13

# Configurar como sitio web estático
aws s3 website s3://practica2semi1a1s2025paginawebg13 --index-document index.html --error-document error.html

# Bucket para archivos
aws s3 mb s3://practica2semi1a1s2025Archivosg#

# Configurar política de acceso público
aws s3api put-bucket-policy --bucket practica2semi1a1s2025Archivosg# --policy file://bucket-policy.json
```

#### 3. Despliegue del Frontend
```bash
# Construir la aplicación React
cd frontend
npm install
npm run build

# Subir al bucket S3
aws s3 sync build/ s3://practica2semi1a1s2025paginawebg13
```

#### 4. Despliegue de Instancias EC2
```bash
# Lanzar instancia para Node.js
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --instance-type t2.micro \
    --key-name mi-key-pair \
    --security-group-ids sg-0123456789abcdef0 \
    --user-data file://setup-nodejs.sh

# Lanzar instancia para Python
aws ec2 run-instances \
    --image-id ami-0abcdef1234567890 \
    --instance-type t2.micro \
    --key-name mi-key-pair \
    --security-group-ids sg-0123456789abcdef0 \
    --user-data file://setup-python.sh
```

#### 5. Configuración del Load Balancer
```bash
# Crear target groups
aws elbv2 create-target-group \
    --name tg-nodejs \
    --protocol HTTP \
    --port 3000 \
    --vpc-id vpc-0abcdef1234567890 \
    --health-check-path /health

aws elbv2 create-target-group \
    --name tg-python \
    --protocol HTTP \
    --port 5000 \
    --vpc-id vpc-0abcdef1234567890 \
    --health-check-path /health

# Registrar instancias en los target groups
aws elbv2 register-targets \
    --target-group-arn arn:aws:elasticloadbalancing:region:account-id:targetgroup/tg-nodejs/abcdef123456 \
    --targets Id=i-0abcdef1234567890

aws elbv2 register-targets \
    --target-group-arn arn:aws:elasticloadbalancing:region:account-id:targetgroup/tg-python/abcdef123456 \
    --targets Id=i-0abcdef1234567891

# Crear load balancer
aws elbv2 create-load-balancer \
    --name taskflow-lb \
    --subnets subnet-abcdef0123456789a subnet-abcdef0123456789b \
    --security-groups sg-0123456789abcdef0

# Crear listener y reglas
aws elbv2 create-listener \
    --load-balancer-arn arn:aws:elasticloadbalancing:region:account-id:loadbalancer/app/taskflow-lb/abcdef123456 \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:region:account-id:targetgroup/tg-nodejs/abcdef123456
```

### Despliegue en Azure

#### 1. Creación de Blob Containers
```bash
# Crear grupo de recursos
az group create --name TaskFlowResourceGroup --location eastus

# Crear cuenta de almacenamiento
az storage account create \
    --name taskflowstorage \
    --resource-group TaskFlowResourceGroup \
    --location eastus \
    --sku Standard_LRS

# Crear container para la página web
az storage container create \
    --name practica2semi1a1s2025paginawebg13 \
    --account-name taskflowstorage \
    --public-access blob

# Habilitar sitio web estático
az storage blob service-properties update \
    --account-name taskflowstorage \
    --static-website \
    --index-document index.html \
    --404-document error.html

# Crear container para archivos
az storage container create \
    --name practica2semi1a1s2025Archivosg# \
    --account-name taskflowstorage \
    --public-access blob
```

#### 2. Despliegue del Frontend
```bash
# Construir la aplicación React
cd frontend
npm install
npm run build

# Subir al blob container
az storage blob upload-batch \
    --source build/ \
    --destination '$web' \
    --account-name taskflowstorage
```

#### 3. Despliegue de VMs
```bash
# Crear VM para Node.js
az vm create \
    --resource-group TaskFlowResourceGroup \
    --name nodejs-vm \
    --image UbuntuLTS \
    --admin-username azureuser \
    --generate-ssh-keys \
    --custom-data setup-nodejs.txt

# Abrir puerto 3000
az vm open-port \
    --resource-group TaskFlowResourceGroup \
    --name nodejs-vm \
    --port 3000

# Crear VM para Python
az vm create \
    --resource-group TaskFlowResourceGroup \
    --name python-vm \
    --image UbuntuLTS \
    --admin-username azureuser \
    --generate-ssh-keys \
    --custom-data setup-python.txt

# Abrir puerto 5000
az vm open-port \
    --resource-group TaskFlowResourceGroup \
    --name python-vm \
    --port 5000
```

#### 4. Configuración del Load Balancer
```bash
# Crear Load Balancer
az network lb create \
    --resource-group TaskFlowResourceGroup \
    --name taskflow-lb \
    --sku Basic \
    --public-ip-address taskflow-lb-ip \
    --frontend-ip-name frontendip \
    --backend-pool-name backendpool

# Crear Health Probe
az network lb probe create \
    --resource-group TaskFlowResourceGroup \
    --lb-name taskflow-lb \
    --name http-probe \
    --protocol http \
    --port 80 \
    --path /health

# Crear regla de balanceo
az network lb rule create \
    --resource-group TaskFlowResourceGroup \
    --lb-name taskflow-lb \
    --name http-rule \
    --protocol tcp \
    --frontend-port 80 \
    --backend-port 80 \
    --frontend-ip-name frontendip \
    --backend-pool-name backendpool \
    --probe-name http-probe
```

## API y Endpoints

### API REST

#### Autenticación
- **POST /api/auth/register**: Registro de usuario
- **POST /api/auth/login**: Inicio de sesión

#### Tareas
- **GET /api/tasks**: Obtener todas las tareas del usuario
- **POST /api/tasks**: Crear nueva tarea
- **PUT /api/tasks/:id**: Actualizar tarea existente
- **DELETE /api/tasks/:id**: Eliminar tarea
- **PATCH /api/tasks/:id/complete**: Marcar tarea como completada

#### Archivos
- **GET /api/files**: Listar archivos del usuario
- **POST /api/files/upload**: Subir archivo (redirige a las funciones Lambda/Azure)
- **GET /api/files/:id**: Obtener metadatos de un archivo
- **DELETE /api/files/:id**: Eliminar archivo

### API Serverless

#### AWS Lambda / API Gateway
- **POST /upload/image**: Subir imagen a S3
- **POST /upload/document**: Subir documento de texto a S3

#### Azure Functions / API Management
- **POST /upload/image**: Subir imagen a Blob Storage
- **POST /upload/document**: Subir documento de texto a Blob Storage