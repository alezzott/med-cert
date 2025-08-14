<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useAuth } from '@/composables/useAuth';
import { sidebarMenu } from '@/routes/sidebar.menu';
import { Home, Users, FileText, PlusSquare, LogOut } from 'lucide-vue-next';

const icons = {
  dashboard: Home,
  users: Users,
  'file-text': FileText,
  'plus-square': PlusSquare,
};

const { logout } = useAuth();

const handleLogout = () => {
  logout();
};
</script>

<template>
  <SidebarProvider>
    <Sidebar class="h-screen">
      <SidebarHeader class="px-4 py-6">
        <span class="text-xl font-bold text-black">MedCert</span>
      </SidebarHeader>

      <SidebarContent class="px-2">
        <SidebarMenu>
          <SidebarMenuItem v-for="item in sidebarMenu" :key="item.to">
            <SidebarMenuButton as-child class="text-black transition-colors">
              <router-link
                :to="item.to"
                class="flex items-center gap-3 px-3 py-2"
              >
                <component
                  :is="icons[item.icon]"
                  :size="20"
                  class="text-black"
                />
                <span>{{ item.name }}</span>
              </router-link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter class="px-2 py-4 border-t border-white/20">
        <SidebarMenu>
          <!-- Logout -->
          <SidebarMenuItem>
            <SidebarMenuButton
              class="text-black transition-colors cursor-pointer"
              @click="handleLogout"
            >
              <div class="flex items-center gap-3 py-2 w-full">
                <LogOut :size="20" class="text-black" />
                <span>Sair</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <!-- Informações do usuário (opcional) -->
        <div class="mt-4 px-3 py-2 text-xs text-black/70">
          <div class="font-medium">Dr. João Silva</div>
          <div class="text-black/50">joao@medcert.com</div>
        </div>
      </SidebarFooter>
    </Sidebar>

    <SidebarInset class="flex-1">
      <header class="flex h-16 items-center gap-4 border-b bg-white px-6">
        <SidebarTrigger class="text-gray-600 hover:text-gray-900" />
        <div class="h-6 w-px bg-gray-200" />
        <h1 class="text-lg font-semibold">Dashboard</h1>
      </header>

      <main class="flex-1 p-6 bg-gray-50">
        <router-view />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>
