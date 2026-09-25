// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'seat_map_list_response_dto_output_items_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$SeatMapListResponseDtoOutputItemsInner
    extends SeatMapListResponseDtoOutputItemsInner {
  @override
  final String id;
  @override
  final String name;
  @override
  final int seatCount;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  factory _$SeatMapListResponseDtoOutputItemsInner(
          [void Function(SeatMapListResponseDtoOutputItemsInnerBuilder)?
              updates]) =>
      (SeatMapListResponseDtoOutputItemsInnerBuilder()..update(updates))
          ._build();

  _$SeatMapListResponseDtoOutputItemsInner._(
      {required this.id,
      required this.name,
      required this.seatCount,
      required this.createdAt,
      required this.updatedAt})
      : super._();
  @override
  SeatMapListResponseDtoOutputItemsInner rebuild(
          void Function(SeatMapListResponseDtoOutputItemsInnerBuilder)
              updates) =>
      (toBuilder()..update(updates)).build();

  @override
  SeatMapListResponseDtoOutputItemsInnerBuilder toBuilder() =>
      SeatMapListResponseDtoOutputItemsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is SeatMapListResponseDtoOutputItemsInner &&
        id == other.id &&
        name == other.name &&
        seatCount == other.seatCount &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, seatCount.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(
            r'SeatMapListResponseDtoOutputItemsInner')
          ..add('id', id)
          ..add('name', name)
          ..add('seatCount', seatCount)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt))
        .toString();
  }
}

class SeatMapListResponseDtoOutputItemsInnerBuilder
    implements
        Builder<SeatMapListResponseDtoOutputItemsInner,
            SeatMapListResponseDtoOutputItemsInnerBuilder> {
  _$SeatMapListResponseDtoOutputItemsInner? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  int? _seatCount;
  int? get seatCount => _$this._seatCount;
  set seatCount(int? seatCount) => _$this._seatCount = seatCount;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  SeatMapListResponseDtoOutputItemsInnerBuilder() {
    SeatMapListResponseDtoOutputItemsInner._defaults(this);
  }

  SeatMapListResponseDtoOutputItemsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _seatCount = $v.seatCount;
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(SeatMapListResponseDtoOutputItemsInner other) {
    _$v = other as _$SeatMapListResponseDtoOutputItemsInner;
  }

  @override
  void update(
      void Function(SeatMapListResponseDtoOutputItemsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  SeatMapListResponseDtoOutputItemsInner build() => _build();

  _$SeatMapListResponseDtoOutputItemsInner _build() {
    final _$result = _$v ??
        _$SeatMapListResponseDtoOutputItemsInner._(
          id: BuiltValueNullFieldError.checkNotNull(
              id, r'SeatMapListResponseDtoOutputItemsInner', 'id'),
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'SeatMapListResponseDtoOutputItemsInner', 'name'),
          seatCount: BuiltValueNullFieldError.checkNotNull(seatCount,
              r'SeatMapListResponseDtoOutputItemsInner', 'seatCount'),
          createdAt: BuiltValueNullFieldError.checkNotNull(createdAt,
              r'SeatMapListResponseDtoOutputItemsInner', 'createdAt'),
          updatedAt: BuiltValueNullFieldError.checkNotNull(updatedAt,
              r'SeatMapListResponseDtoOutputItemsInner', 'updatedAt'),
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
