# step 8) Create static Web App for frontend
resource "azurerm_static_web_app" "frontend_webapp" {
  name                = "${local.name_prefix}-echo-brief-frontend-${random_string.unique.result}"
  resource_group_name = azurerm_resource_group.rg.name
  location            = var.static_web_location
  tags                = local.default_tags
}

resource "null_resource" "copy_frontend_source_code" {
  # triggers = {
  #   always_run = timestamp() # Forces re-execution every time Terraform runs
  # }

  provisioner "local-exec" {
    command     = local.copy_frontend_command
    working_dir = path.module # Ensures it runs from the correct directory
  }
}

# resource "null_resource" "replace_name_api" {
#   provisioner "local-exec" {
#     command = <<-EOT
#       powershell -Command "(Get-Content '.\\frontend_app\\constants\\apiConstants.js') |
#         ForEach-Object {
#           $_ -replace 'BASE_NAME = \\\"BASE_NAME\\\"', 'BASE_NAME = \\\"${local.name_prefix}-echo-brief-backend-api-${random_string.unique.result}\\\"'
#         } |
#         Set-Content '.\\frontend_app\\constants\\apiConstants.js'"
#     EOT
#   }

#   depends_on = [null_resource.copy_frontend_source_code]
# }



# Define local-exec provisioner to run az cli commands
resource "null_resource" "publish_website" {
  #triggers = {always_run = "${timestamp()}"}
  provisioner "local-exec" {
    command = "swa deploy ./frontend_app/out --env production  --subscription-id '${var.subscription_id}'  --resource-group '${azurerm_static_web_app.frontend_webapp.resource_group_name}'  --app-name '${azurerm_static_web_app.frontend_webapp.name}'"
  }

  depends_on = [null_resource.copy_frontend_source_code]
}
