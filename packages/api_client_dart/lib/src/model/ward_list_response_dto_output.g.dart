// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'ward_list_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$WardListResponseDtoOutput extends WardListResponseDtoOutput {
  @override
  final BuiltList<WardListResponseDtoOutputItemsInner> items;

  factory _$WardListResponseDtoOutput(
          [void Function(WardListResponseDtoOutputBuilder)? updates]) =>
      (WardListResponseDtoOutputBuilder()..update(updates))._build();

  _$WardListResponseDtoOutput._({required this.items}) : super._();
  @override
  WardListResponseDtoOutput rebuild(
          void Function(WardListResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  WardListResponseDtoOutputBuilder toBuilder() =>
      WardListResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is WardListResponseDtoOutput && items == other.items;
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
    return (newBuiltValueToStringHelper(r'WardListResponseDtoOutput')
          ..add('items', items))
        .toString();
  }
}

class WardListResponseDtoOutputBuilder
    implements
        Builder<WardListResponseDtoOutput, WardListResponseDtoOutputBuilder> {
  _$WardListResponseDtoOutput? _$v;

  ListBuilder<WardListResponseDtoOutputItemsInner>? _items;
  ListBuilder<WardListResponseDtoOutputItemsInner> get items =>
      _$this._items ??= ListBuilder<WardListResponseDtoOutputItemsInner>();
  set items(ListBuilder<WardListResponseDtoOutputItemsInner>? items) =>
      _$this._items = items;

  WardListResponseDtoOutputBuilder() {
    WardListResponseDtoOutput._defaults(this);
  }

  WardListResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _items = $v.items.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(WardListResponseDtoOutput other) {
    _$v = other as _$WardListResponseDtoOutput;
  }

  @override
  void update(void Function(WardListResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  WardListResponseDtoOutput build() => _build();

  _$WardListResponseDtoOutput _build() {
    _$WardListResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$WardListResponseDtoOutput._(
            items: items.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'items';
        items.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'WardListResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
