from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.db import models
from .models import User
from Diary_todo.models import Diary, Todo


# Inline for Diaries in User admin
class DiaryInline(admin.TabularInline):
    """
    Inline admin for managing diaries within user profile
    """
    model = Diary
    extra = 1
    fields = ('text',)
    readonly_fields = ('pub_date',)
    show_change_link = True
    
    # Make text field smaller in inline
    formfield_overrides = {
        models.TextField: {'widget': admin.widgets.AdminTextareaWidget(attrs={'rows': 2, 'cols': 40})},
    }


# Inline for Todos in User admin
class TodoInlineForUser(admin.TabularInline):
    """
    Inline admin for managing todos directly under user
    """
    model = Todo
    extra = 2
    fields = ('title', 'start_time', 'end_time', 'status')
    show_change_link = True


# Custom User Admin with direct diary and todo management
@admin.register(User)
class CustomUserAdmin(UserAdmin):
    """
    Custom admin for User model with direct diary and todo management
    """
    list_display = ('email', 'username', 'first_name', 'last_name', 'diary_count', 'todo_count', 'is_staff', 'two_fa', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'two_fa', 'date_joined')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('email',)
    
    # Include diaries and todos as inlines
    inlines = [DiaryInline, TodoInlineForUser]
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('first_name', 'last_name', 'username')}),
        ('Security', {'fields': ('two_fa',)}),
        ('Permissions', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'username', 'password1', 'password2', 'two_fa'),
        }),
    )
    
    # Custom methods to show diary and todo counts
    def diary_count(self, obj):
        return obj.diaries.count()
    diary_count.short_description = 'Diaries'
    
    def todo_count(self, obj):
        return obj.todos.count()
    todo_count.short_description = 'Todos'
    
    # Optimize queries
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.prefetch_related('diaries', 'todos')


# Diary Admin - Simplified
@admin.register(Diary)
class DiaryAdmin(admin.ModelAdmin):
    """
    Admin for Diary model - standalone entries
    """
    list_display = ('user_info', 'pub_date', 'text_preview', 'user_todo_count')
    list_filter = ('pub_date', 'user__is_staff', 'user')
    search_fields = ('user__email', 'user__username', 'text')
    date_hierarchy = 'pub_date'
    ordering = ('-pub_date',)
    
    # Fields for add/edit forms
    fields = ('user', 'text')
    readonly_fields = ('pub_date',)
    
    # Make text field larger
    formfield_overrides = {
        models.TextField: {'widget': admin.widgets.AdminTextareaWidget(attrs={'rows': 8, 'cols': 80})},
    }
    
    # Custom display methods
    def user_info(self, obj):
        return f"{obj.user.email} ({obj.user.username})"
    user_info.short_description = 'User'
    user_info.admin_order_field = 'user__email'
    
    def text_preview(self, obj):
        return obj.text[:80] + '...' if len(obj.text) > 80 else obj.text
    text_preview.short_description = 'Content Preview'
    
    def user_todo_count(self, obj):
        """Show total todos for this user"""
        return obj.user.todos.count()
    user_todo_count.short_description = 'User Todos'
    
    # Optimize queries
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user').prefetch_related('user__todos')


# Todo Admin - Direct user relationship
@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    """
    Admin for Todo model with direct user relationship
    """
    list_display = ('title', 'user_info', 'time_range', 'status', 'duration_display')
    list_filter = ('status', 'user')
    search_fields = ('title', 'description', 'user__email', 'user__username')
    ordering = ('user', 'start_time')
    
    # Form fields for add/edit
    fields = ('user', 'title', 'description', 'start_time', 'end_time', 'status')
    
    # Make description field larger
    formfield_overrides = {
        models.TextField: {'widget': admin.widgets.AdminTextareaWidget(attrs={'rows': 3, 'cols': 60})},
    }
    
    # Custom display methods
    def user_info(self, obj):
        return f"{obj.user.email} ({obj.user.username})"
    user_info.short_description = 'User'
    user_info.admin_order_field = 'user__email'
    
    def time_range(self, obj):
        return f"{obj.start_time.strftime('%H:%M')} - {obj.end_time.strftime('%H:%M')}"
    time_range.short_description = 'Time'
    
    def duration_display(self, obj):
        from datetime import datetime, timedelta
        start = datetime.combine(datetime.today(), obj.start_time)
        end = datetime.combine(datetime.today(), obj.end_time)
        if end < start:
            end += timedelta(days=1)
        duration = end - start
        hours, remainder = divmod(duration.seconds, 3600)
        minutes, _ = divmod(remainder, 60)
        return f"{hours}h {minutes}m"
    duration_display.short_description = 'Duration'
    
    # Bulk actions for status changes
    actions = ['mark_completed', 'mark_in_progress', 'mark_not_started']
    
    def mark_completed(self, request, queryset):
        updated = queryset.update(status='completed')
        self.message_user(request, f"{updated} todos marked as completed.")
    mark_completed.short_description = "Mark selected todos as completed"
    
    def mark_in_progress(self, request, queryset):
        updated = queryset.update(status='in_progress')
        self.message_user(request, f"{updated} todos marked as in progress.")
    mark_in_progress.short_description = "Mark selected todos as in progress"
    
    def mark_not_started(self, request, queryset):
        updated = queryset.update(status='not_started')
        self.message_user(request, f"{updated} todos marked as not started.")
    mark_not_started.short_description = "Mark selected todos as not started"
    
    # Optimize queries
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('user')


# Customize admin site
admin.site.site_header = "My Day Admin Panel"
admin.site.site_title = "My Day Admin"
admin.site.index_title = "Manage Users, Diaries & Todos"