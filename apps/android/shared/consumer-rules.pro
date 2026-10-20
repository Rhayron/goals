# kotlinx.serialization: as classes @Serializable e os serializers gerados
-keepattributes *Annotation*, InnerClasses
-dontnote kotlinx.serialization.**
-keepclassmembers class br.app.coado.** {
    *** Companion;
}
-keepclasseswithmembers class br.app.coado.** {
    kotlinx.serialization.KSerializer serializer(...);
}
-keep,includedescriptorclasses class br.app.coado.**$$serializer { *; }

# o WorkManager abre o banco dele (Room) por reflexão. A regra do room-runtime 2.6 guarda a classe
# sem o construtor, e o R8 em modo completo o remove: o app caía ao abrir no release
-keep class * extends androidx.room.RoomDatabase { void <init>(); }
