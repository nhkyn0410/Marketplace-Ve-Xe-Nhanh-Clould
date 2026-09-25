// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'province_list_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ProvinceListResponseDtoOutput extends ProvinceListResponseDtoOutput {
  @override
  final BuiltList<ProvinceListResponseDtoOutputItemsInner> items;

  factory _$ProvinceListResponseDtoOutput(
          [void Function(ProvinceListResponseDtoOutputBuilder)? updates]) =>
      (ProvinceListResponseDtoOutputBuilder()..update(updates))._build();

  _$ProvinceListResponseDtoOutput._({required this.items}) : super._();
  @override
  ProvinceListResponseDtoOutput rebuild(
          void Function(ProvinceListResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ProvinceListResponseDtoOutputBuilder toBuilder() =>
      ProvinceListResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ProvinceListResponseDtoOutput && items == other.items;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, items.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ProvinceListResponseDtoOutput')
          ..add('items', items))
        .toString();
  }
}

class ProvinceListResponseDtoOutputBuilder
    implements
        Builder<ProvinceListResponseDtoOutput,
            ProvinceListResponseDtoOutputBuilder> {
  _$ProvinceListResponseDtoOutput? _$v;

  ListBuilder<ProvinceListResponseDtoOutputItemsInner>? _items;
  ListBuilder<ProvinceListResponseDtoOutputItemsInner> get items =>
      _$this._items ??= ListBuilder<ProvinceListResponseDtoOutputItemsInner>();
  set items(ListBuilder<ProvinceListResponseDtoOutputItemsInner>? items) =>
      _$this._items = items;

  ProvinceListResponseDtoOutputBuilder() {
    ProvinceListResponseDtoOutput._defaults(this);
  }

  ProvinceListResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ProvinceListResponseDtoOutput other) {
    _$v = other as _$ProvinceListResponseDtoOutput;
  }

  @override
  void update(void Function(ProvinceListResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ProvinceListResponseDtoOutput build() => _build();

  _$ProvinceListResponseDtoOutput _build() {
    _$ProvinceListResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$ProvinceListResponseDtoOutput._(
            items: items.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'ProvinceListResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
