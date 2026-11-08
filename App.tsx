import React, { useState } from 'react';
import {
  ActivityIndicator, Image, Keyboard, KeyboardAvoidingView, Platform,
  SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { fetchMovieWithYoda, MovieData } from './services/api';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movieData, setMovieData] = useState<MovieData | null>(null);

  const handleSearch = async () => {
    const query = searchQuery.trim();
    if (!query) {
      setError('Digite o nome de um filme para buscar.');
      return;
    }
    Keyboard.dismiss();
    setLoading(true);
    setError(null);
    setMovieData(null);

    try {
      // Todo o encadeamento TMDB → FunTranslations acontece no serviço
      setMovieData(await fetchMovieWithYoda(query));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Algo deu errado. Tente novamente.');
    } finally {
      setLoading(false); // sempre limpa o loading
    }
  };

  const isIdle = !loading && !error && !movieData;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>Sinopse, versão Yoda</Text>
          <Text style={styles.subheading}>Busque um filme e leia o resumo como o mestre falaria.</Text>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.input}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Ex.: Star Wars"
              placeholderTextColor="#8C84A8"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSearch}
              disabled={loading}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Buscar</Text>
            </TouchableOpacity>
          </View>

          {/* Idle */}
          {isIdle && (
            <Text style={styles.hint}>Digite o nome de um filme e toque em Buscar.</Text>
          )}

          {/* Loading */}
          {loading && (
            <View style={styles.center}>
              <ActivityIndicator size="large" color="#F2B544" />
              <Text style={styles.hint}>Buscando filme e transformando a sinopse…</Text>
            </View>
          )}

          {/* Error */}
          {!!error && !loading && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Success */}
          {movieData && !loading && (
            <View style={styles.card}>
              {movieData.posterUrl ? (
                <Image source={{ uri: movieData.posterUrl }} style={styles.poster} resizeMode="cover" />
              ) : (
                <View style={[styles.poster, styles.posterEmpty]}>
                  <Text style={styles.hint}>Sem pôster</Text>
                </View>
              )}

              <Text style={styles.title}>{movieData.title}</Text>

              <Text style={styles.label}>Sinopse original</Text>
              <Text style={styles.body}>{movieData.overview}</Text>

              <View style={styles.yodaBox}>
                <Text style={styles.yodaLabel}>Versão Yoda</Text>
                {movieData.yodaText ? (
                  <Text style={styles.yodaBody}>{movieData.yodaText}</Text>
                ) : (
                  <Text style={styles.body}>{movieData.yodaNotice}</Text>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: '#1B1530', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 },
  content: { padding: 20, paddingBottom: 40 },
  heading: { color: '#FFFFFF', fontSize: 28, fontWeight: '700', marginTop: 12 },
  subheading: { color: '#B9B1D3', fontSize: 15, lineHeight: 22, marginTop: 6, marginBottom: 20 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  input: {
    flex: 1, backgroundColor: '#2A2147', color: '#FFFFFF', borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 12, fontSize: 16,
  },
  button: { backgroundColor: '#F2B544', borderRadius: 12, paddingHorizontal: 20, justifyContent: 'center' },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: '#1B1530', fontSize: 16, fontWeight: '700' },
  center: { alignItems: 'center', gap: 12, marginTop: 24 },
  hint: { color: '#8C84A8', fontSize: 15, textAlign: 'center' },
  errorBox: { backgroundColor: '#3B1F33', borderColor: '#E0627A', borderWidth: 1, borderRadius: 12, padding: 16 },
  errorText: { color: '#FFB4C0', fontSize: 15, lineHeight: 22 },
  card: { backgroundColor: '#2A2147', borderRadius: 16, padding: 16 },
  // Proporção fixa 2:3 (padrão de pôsteres) evita layout shift
  poster: { width: '60%', aspectRatio: 2 / 3, alignSelf: 'center', borderRadius: 12, backgroundColor: '#1B1530' },
  posterEmpty: { alignItems: 'center', justifyContent: 'center' },
  title: { color: '#FFFFFF', fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 16, marginBottom: 16 },
  label: { color: '#F2B544', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  body: { color: '#E4DFF2', fontSize: 15, lineHeight: 23 },
  yodaBox: { backgroundColor: '#1F3A2E', borderRadius: 12, padding: 14, marginTop: 18 },
  yodaLabel: { color: '#9BD17A', fontSize: 14, fontWeight: '600', marginBottom: 6 },
  yodaBody: { color: '#E3F5D8', fontSize: 16, lineHeight: 24, fontStyle: 'italic' },
});
