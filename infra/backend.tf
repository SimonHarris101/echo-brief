terraform {
  backend "azurerm" {
    resource_group_name  = "terraform"
    storage_account_name = "owtfukssrsnlp005"
    container_name       = "tfstate"
    key                  = "echo-brief.tfstate"
    use_azuread_auth     = true
  }
}
