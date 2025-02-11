#Speech
resource "azurerm_cognitive_account" "SpeechServices" {
  resource_group_name           = azurerm_resource_group.rg.name
  custom_subdomain_name         = "echobrief${random_string.unique.result}"
  kind                          = "SpeechServices"
  local_auth_enabled            = true
  location                      = azurerm_resource_group.rg.location
  name                          = "echobrief${random_string.unique.result}"
  public_network_access_enabled = true


  sku_name = var.speech_sku
  tags     = local.default_tags
  identity {
    type = "SystemAssigned"
  }

  lifecycle {
    ignore_changes = [
      tags
    ]
  }

}
