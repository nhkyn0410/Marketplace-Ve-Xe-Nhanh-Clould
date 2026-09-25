// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'amenity_list_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$AmenityListResponseDtoOutput extends AmenityListResponseDtoOutput {
  @override
  final BuiltList<ProvinceListResponseDtoOutputItemsInner> items;

  factory _$AmenityListResponseDtoOutput(
          [void Function(AmenityListResponseDtoOutputBuilder)? updates]) =>
      (AmenityListResponseDtoOutputBuilder()..update(updates))._build();

  _$AmenityListResponseDtoOutput._({required this.items}) : super._();
  @override
  AmenityListResponseDtoOutput rebuild(
          void Function(AmenityListResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  AmenityListResponseDtoOutputBuilder toBuilder() =>
      AmenityListResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is AmenityListResponseDtoOutput && items == other.items;
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
    return (newBuiltValueToStringHelper(r'AmenityListResponseDtoOutput')
          ..add('items', items))
        .toString();
  }
}

class AmenityListResponseDtoOutputBuilder
    implements
        Builder<AmenityListResponseDtoOutput,
            AmenityListResponseDtoOutputBuilder> {
  _$AmenityListResponseDtoOutput? _$v;

  ListBuilder<ProvinceListResponseDtoOutputItemsInner>? _items;
  ListBuilder<ProvinceListResponseDtoOutputItemsInner> get items =>
      _$this._items ??= ListBuilder<ProvinceListResponseDtoOutputItemsInner>();
  set items(ListBuilder<ProvinceListResponseDtoOutputItemsInner>? items) =>
      _$this._items = items;

  AmenityListResponseDtoOutputBuilder() {
    AmenityListResponseDtoOutput._defaults(this);
  }

  AmenityListResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(AmenityListResponseDtoOutput other) {
    _$v = other as _$AmenityListResponseDtoOutput;
  }

  @override
  void update(void Function(AmenityListResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  AmenityListResponseDtoOutput build() => _build();

  _$AmenityListResponseDtoOutput _build() {
    _$AmenityListResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$AmenityListResponseDtoOutput._(
            items: items.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'AmenityListResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
