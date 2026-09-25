// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'employee_list_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$EmployeeListResponseDtoOutput extends EmployeeListResponseDtoOutput {
  @override
  final BuiltList<EmployeeListResponseDtoOutputItemsInner> items;
  @override
  final String? nextCursor;

  factory _$EmployeeListResponseDtoOutput(
          [void Function(EmployeeListResponseDtoOutputBuilder)? updates]) =>
      (EmployeeListResponseDtoOutputBuilder()..update(updates))._build();

  _$EmployeeListResponseDtoOutput._({required this.items, this.nextCursor})
      : super._();
  @override
  EmployeeListResponseDtoOutput rebuild(
          void Function(EmployeeListResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  EmployeeListResponseDtoOutputBuilder toBuilder() =>
      EmployeeListResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is EmployeeListResponseDtoOutput &&
        items == other.items &&
        nextCursor == other.nextCursor;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jc(_$hash, nextCursor.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'EmployeeListResponseDtoOutput')
          ..add('items', items)
          ..add('nextCursor', nextCursor))
        .toString();
  }
}

class EmployeeListResponseDtoOutputBuilder
    implements
        Builder<EmployeeListResponseDtoOutput,
            EmployeeListResponseDtoOutputBuilder> {
  _$EmployeeListResponseDtoOutput? _$v;

  ListBuilder<EmployeeListResponseDtoOutputItemsInner>? _items;
  ListBuilder<EmployeeListResponseDtoOutputItemsInner> get items =>
      _$this._items ??= ListBuilder<EmployeeListResponseDtoOutputItemsInner>();
  set items(ListBuilder<EmployeeListResponseDtoOutputItemsInner>? items) =>
      _$this._items = items;

  String? _nextCursor;
  String? get nextCursor => _$this._nextCursor;
  set nextCursor(String? nextCursor) => _$this._nextCursor = nextCursor;

  EmployeeListResponseDtoOutputBuilder() {
    EmployeeListResponseDtoOutput._defaults(this);
  }

  EmployeeListResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _nextCursor = $v.nextCursor;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(EmployeeListResponseDtoOutput other) {
    _$v = other as _$EmployeeListResponseDtoOutput;
  }

  @override
  void update(void Function(EmployeeListResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  EmployeeListResponseDtoOutput build() => _build();

  _$EmployeeListResponseDtoOutput _build() {
    _$EmployeeListResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$EmployeeListResponseDtoOutput._(
            items: items.build(),
            nextCursor: nextCursor,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'EmployeeListResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
