import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput, SafeAreaView, Platform } from 'react-native';
import { theme } from '../theme';
import { MaterialIcon } from './MaterialIcon';

interface Option {
    id: string;
    name: string;
    description?: string;
}

interface ComboBoxProps {
    label: string;
    options: Option[];
    selectedIds: string[];
    onSelect: (id: string) => void;
    onRemove: (id: string) => void;
    placeholder?: string;
}

export const ComboBox: React.FC<ComboBoxProps> = ({
    label,
    options,
    selectedIds,
    onSelect,
    onRemove,
    placeholder = 'Select options...'
}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredOptions = useMemo(() => {
        return options.filter(opt =>
            opt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (opt.description && opt.description.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [options, searchQuery]);

    const selectedOptions = useMemo(() => {
        return options.filter(opt => selectedIds.includes(opt.id));
    }, [options, selectedIds]);

    const handleToggle = (id: string) => {
        if (selectedIds.includes(id)) {
            onRemove(id);
        } else {
            onSelect(id);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <TouchableOpacity
                style={styles.selector}
                onPress={() => setModalVisible(true)}
                activeOpacity={0.7}
            >
                <View style={styles.selectedContent}>
                    {selectedOptions.length > 0 ? (
                        <View style={styles.tagsContainer}>
                            {selectedOptions.map(opt => (
                                <View key={opt.id} style={styles.tag}>
                                    <Text style={styles.tagText} numberOfLines={1}>{opt.name}</Text>
                                    <TouchableOpacity onPress={() => onRemove(opt.id)} style={styles.tagRemove}>
                                        <MaterialIcon name="close" size={14} color={theme.colors.white} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    ) : (
                        <Text style={styles.placeholder}>{placeholder}</Text>
                    )}
                </View>
                <MaterialIcon name="expand-more" size={24} color={theme.colors.primary} />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <SafeAreaView style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{label}</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
                                <MaterialIcon name="close" size={24} color={theme.colors.primary} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.searchContainer}>
                            <MaterialIcon name="search" size={20} color="#64748B" style={styles.searchIcon} />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                placeholderTextColor="#94A3B8"
                            />
                        </View>

                        <FlatList
                            data={filteredOptions}
                            keyExtractor={(item) => item.id}
                            contentContainerStyle={styles.listContent}
                            renderItem={({ item }) => {
                                const isSelected = selectedIds.includes(item.id);
                                return (
                                    <TouchableOpacity
                                        style={[styles.optionItem, isSelected && styles.selectedOption]}
                                        onPress={() => handleToggle(item.id)}
                                    >
                                        <View style={styles.optionTextContainer}>
                                            <Text style={[styles.optionName, isSelected && styles.selectedOptionText]}>
                                                {item.name}
                                            </Text>
                                            {item.description && (
                                                <Text style={styles.optionDesc} numberOfLines={2}>
                                                    {item.description}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                                            {isSelected && <MaterialIcon name="check" size={16} color={theme.colors.white} />}
                                        </View>
                                    </TouchableOpacity>
                                );
                            }}
                        />
                        <View style={styles.modalFooter}>
                            <TouchableOpacity
                                style={styles.doneButton}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.doneButtonText}>Done</Text>
                            </TouchableOpacity>
                        </View>
                    </SafeAreaView>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        ...theme.typography.label,
        color: theme.colors.primary,
        marginBottom: theme.spacing.sm,
    },
    selector: {
        backgroundColor: theme.colors.inputBackground,
        borderRadius: theme.borderRadius.lg,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        minHeight: 56,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    selectedContent: {
        flex: 1,
    },
    placeholder: {
        color: theme.colors.placeholder,
        fontSize: 16,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    tag: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.sm,
        paddingHorizontal: 10,
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: '100%',
    },
    tagText: {
        color: theme.colors.white,
        fontSize: 12,
        fontWeight: '600',
        marginRight: 4,
    },
    tagRemove: {
        padding: 2,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.white,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        height: '85%',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -3 },
                shadowOpacity: 0.1,
                shadowRadius: 5,
            },
            android: {
                elevation: 20,
            },
        }),
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    modalTitle: {
        ...theme.typography.h2,
        fontSize: 20,
        color: theme.colors.primary,
    },
    closeButton: {
        padding: 4,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F1F5F9',
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: 48,
        fontSize: 16,
        color: theme.colors.primary,
    },
    listContent: {
        paddingBottom: 20,
    },
    optionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F8FAFC',
    },
    selectedOption: {
        backgroundColor: '#F0F7FF',
    },
    optionTextContainer: {
        flex: 1,
    },
    optionName: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1E293B',
    },
    selectedOptionText: {
        color: theme.colors.primary,
        fontWeight: '600',
    },
    optionDesc: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 4,
        lineHeight: 18,
    },
    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: '#CBD5E1',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 16,
    },
    checkboxSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    modalFooter: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        backgroundColor: theme.colors.white,
    },
    doneButton: {
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        height: 56,
        alignItems: 'center',
        justifyContent: 'center',
    },
    doneButtonText: {
        color: theme.colors.white,
        fontSize: 16,
        fontWeight: '700',
    },
});
